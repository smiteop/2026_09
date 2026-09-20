const { DateTime } = require('luxon');
const { Op } = require('sequelize');
const { Doctor, DoctorWorkingHour, DoctorUnavailability, Appointment } = require('../models');
const { NotFoundError, ValidationError } = require('../utils/errors');
const ClinicService = require('./clinic.service');

class SlotService {
  /**
   * Generates available appointment slots for a doctor on a clinic-local date (YYYY-MM-DD).
   */
  static async getAvailableSlots(doctorId, dateString) {
    // 1. Fetch clinic settings for timezone
    const clinic = await ClinicService.getSettings();
    const clinicTz = clinic.timezone;

    // 2. Fetch Doctor
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor || !doctor.isActive) {
      throw new NotFoundError('Doctor not found or inactive');
    }
    const durationMin = doctor.slotDurationMinutes;

    // 3. Parse target date at midnight in clinic timezone
    const localDayStart = DateTime.fromISO(dateString, { zone: clinicTz }).startOf('day');
    if (!localDayStart.isValid) {
      throw new ValidationError(`Invalid date format: '${dateString}'. Must be YYYY-MM-DD.`);
    }

    // Convert weekday: Luxon (1=Mon ... 7=Sun) -> Standard (0=Sun, 1=Mon ... 6=Sat)
    const dayOfWeek = localDayStart.weekday % 7;

    // 4. Fetch Doctor's Active Working Hours (Availability) for this day
    const workingHours = await DoctorWorkingHour.findAll({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true,
      },
      order: [['startTime', 'ASC']],
    });

    if (!workingHours.length) {
      return {
        doctorId,
        date: dateString,
        clinicTimezone: clinicTz,
        slots: [],
      };
    }

    // 5. Calculate day UTC start & end bounds for DB overlap query
    const dayStartUTC = localDayStart.toUTC().toJSDate();
    const dayEndUTC = localDayStart.endOf('day').toUTC().toJSDate();
    const nowUTC = new Date();

    // 6. Fetch Unavailability intervals overlapping with this date range
    const unavailabilities = await DoctorUnavailability.findAll({
      where: {
        doctorId,
        startAt: { [Op.lt]: dayEndUTC },
        endAt: { [Op.gt]: dayStartUTC },
      },
    });

    // 7. Fetch Existing Booked Appointments (SCHEDULED) overlapping with range
    const bookedAppointments = await Appointment.findAll({
      where: {
        doctorId,
        status: 'SCHEDULED',
        startAt: { [Op.lt]: dayEndUTC },
        endAt: { [Op.gt]: dayStartUTC },
      },
    });

    // 8. Generate Candidate Slots
    const slots = [];

    for (const wh of workingHours) {
      const [startH, startM] = wh.startTime.split(':').map(Number);
      const [endH, endM] = wh.endTime.split(':').map(Number);

      let currentSlotStartLocal = localDayStart.set({ hour: startH, minute: startM, second: 0, millisecond: 0 });
      const whEndLocal = localDayStart.set({ hour: endH, minute: endM, second: 0, millisecond: 0 });

      while (currentSlotStartLocal.plus({ minutes: durationMin }) <= whEndLocal) {
        const currentSlotEndLocal = currentSlotStartLocal.plus({ minutes: durationMin });

        const slotStartUTC = currentSlotStartLocal.toUTC().toJSDate();
        const slotEndUTC = currentSlotEndLocal.toUTC().toJSDate();

        // 8a. Filter out past slots
        if (slotStartUTC <= nowUTC) {
          currentSlotStartLocal = currentSlotEndLocal;
          continue;
        }

        // 8b. Check overlap with Unavailability
        const isUnavailable = unavailabilities.some((u) => {
          const unavailStart = new Date(u.startAt);
          const unavailEnd = new Date(u.endAt);
          return slotStartUTC < unavailEnd && slotEndUTC > unavailStart;
        });

        // 8c. Check overlap with Booked Appointments
        const isBooked = bookedAppointments.some((b) => {
          const apptStart = new Date(b.startAt);
          const apptEnd = new Date(b.endAt);
          return slotStartUTC < apptEnd && slotEndUTC > apptStart;
        });

        if (!isUnavailable && !isBooked) {
          slots.push({
            start: slotStartUTC.toISOString(),
            end: slotEndUTC.toISOString(),
          });
        }

        currentSlotStartLocal = currentSlotEndLocal;
      }
    }

    return {
      doctorId,
      date: dateString,
      clinicTimezone: clinicTz,
      slots,
    };
  }
}

module.exports = SlotService;
