const { sequelize, Appointment, Doctor, DoctorWorkingHour, DoctorUnavailability } = require('../models');
const { AppError, ConflictError, NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');
const { Op } = require('sequelize');
const { DateTime } = require('luxon');
const ClinicService = require('./clinic.service');

class BookingService {
  static async bookAppointment({ doctorId, userId, startAt, startTime, notes }) {
    const rawStart = startAt || startTime;
    const start = new Date(rawStart);

    if (isNaN(start.getTime())) {
      throw new ValidationError('Invalid appointment start timestamp');
    }

    const now = new Date();
    if (start <= now) {
      throw new ValidationError('Appointment timestamp must be in the future');
    }

    return await sequelize.transaction(async (t) => {
      // 1. Validate Doctor exists and is active
      const doctor = await Doctor.findByPk(doctorId, { transaction: t });
      if (!doctor) {
        throw new NotFoundError('Doctor not found');
      }
      if (!doctor.isActive) {
        throw new ValidationError('Doctor is currently inactive');
      }

      // Calculate endAt based on doctor.slotDurationMinutes
      const end = new Date(start.getTime() + doctor.slotDurationMinutes * 60 * 1000);

      // 2. Validate requested slot belongs to doctor's working schedule
      const clinic = await ClinicService.getSettings();
      const clinicTz = clinic.timezone;

      const localStart = DateTime.fromJSDate(start, { zone: clinicTz });
      const localEnd = DateTime.fromJSDate(end, { zone: clinicTz });
      const dayOfWeek = localStart.weekday % 7; // 0 = Sun, 1 = Mon ... 6 = Sat

      const workingHours = await DoctorWorkingHour.findAll({
        where: { doctorId, dayOfWeek, isActive: true },
        transaction: t,
      });

      const formattedStartStr = localStart.toFormat('HH:mm:ss');
      const formattedEndStr = localEnd.toFormat('HH:mm:ss');

      const isWithinSchedule = workingHours.some((wh) => {
        return formattedStartStr >= wh.startTime && formattedEndStr <= wh.endTime;
      });

      if (!isWithinSchedule) {
        throw new ValidationError('Requested appointment slot is outside doctor working hours');
      }

      // 3. Validate no overlap with doctor unavailabilities
      const unavail = await DoctorUnavailability.findOne({
        where: {
          doctorId,
          startAt: { [Op.lt]: end },
          endAt: { [Op.gt]: start },
        },
        transaction: t,
      });

      if (unavail) {
        throw new ConflictError('Doctor is unavailable during the requested time period');
      }

      // 4. Managed FOR UPDATE lock check against existing booked appointments
      const existingBooking = await Appointment.findOne({
        where: {
          doctorId,
          status: 'SCHEDULED',
          startAt: { [Op.lt]: end },
          endAt: { [Op.gt]: start },
        },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (existingBooking) {
        throw new ConflictError('This appointment slot has already been booked.');
      }

      // 5. Create Appointment (Database unique/exclusion constraint guarantees physical concurrency protection)
      try {
        const appointment = await Appointment.create(
          {
            doctorId,
            userId,
            startAt: start,
            endAt: end,
            status: 'SCHEDULED',
            notes,
          },
          { transaction: t }
        );

        return appointment;
      } catch (error) {
        if (
          error.name === 'SequelizeExclusionConstraintError' ||
          error.original?.code === '23P01' ||
          error.name === 'SequelizeUniqueConstraintError' ||
          error.original?.code === '23505'
        ) {
          throw new ConflictError('This appointment slot has already been booked.');
        }
        throw error;
      }
    });
  }

  static async getUserAppointments(userId) {
    return await Appointment.findAll({
      where: { userId },
      include: [
        { model: Doctor, as: 'doctor', attributes: ['id', 'name', 'specialization', 'email', 'phone'] },
      ],
      order: [['startAt', 'ASC']],
    });
  }

  static async cancelAppointment(appointmentId, userId, userRole) {
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    if (userRole !== 'ADMIN' && appointment.userId !== userId) {
      throw new ForbiddenError('You can only cancel your own appointments');
    }

    if (appointment.status === 'CANCELLED') {
      throw new ValidationError('Appointment is already cancelled');
    }

    appointment.status = 'CANCELLED';
    await appointment.save();
    return appointment;
  }
}

module.exports = BookingService;
