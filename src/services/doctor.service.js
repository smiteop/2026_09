const { Doctor, DoctorWorkingHour, DoctorUnavailability, sequelize } = require('../models');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const { Op } = require('sequelize');

class DoctorService {
  static async createDoctor({ name, specialization, email, phone, slotDurationMinutes = 30, isActive = true }) {
    const existing = await Doctor.findOne({ where: { email } });
    if (existing) {
      throw new ConflictError('Doctor with this email already exists');
    }

    return await Doctor.create({
      name,
      specialization,
      email,
      phone,
      slotDurationMinutes,
      isActive,
    });
  }

  static async updateDoctor(doctorId, updates) {
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    if (updates.email && updates.email !== doctor.email) {
      const existing = await Doctor.findOne({ where: { email: updates.email } });
      if (existing) {
        throw new ConflictError('Doctor with this email already exists');
      }
    }

    if (updates.name !== undefined) doctor.name = updates.name;
    if (updates.specialization !== undefined) doctor.specialization = updates.specialization;
    if (updates.email !== undefined) doctor.email = updates.email;
    if (updates.phone !== undefined) doctor.phone = updates.phone;
    if (updates.slotDurationMinutes !== undefined) doctor.slotDurationMinutes = updates.slotDurationMinutes;
    if (updates.isActive !== undefined) doctor.isActive = updates.isActive;

    await doctor.save();
    return doctor;
  }

  static async setDoctorStatus(doctorId, isActive) {
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    doctor.isActive = isActive;
    await doctor.save();
    return doctor;
  }

  static async listDoctors({ onlyActive = false } = {}) {
    const where = onlyActive ? { isActive: true } : {};
    return await Doctor.findAll({
      where,
      include: [
        { model: DoctorWorkingHour, as: 'availabilities' },
      ],
      order: [['name', 'ASC']],
    });
  }

  static async getDoctorById(doctorId) {
    const doctor = await Doctor.findByPk(doctorId, {
      include: [
        { model: DoctorWorkingHour, as: 'availabilities' },
        { model: DoctorUnavailability, as: 'unavailabilities' },
      ],
    });
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }
    return doctor;
  }

  // --- AVAILABILITY MANAGEMENT ---

  static async addAvailability(doctorId, { dayOfWeek, startTime, endTime }) {
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    if (startTime >= endTime) {
      throw new ValidationError('startTime must be strictly earlier than endTime');
    }

    // Check for overlapping schedule on the same dayOfWeek
    const existing = await DoctorWorkingHour.findAll({
      where: { doctorId, dayOfWeek, isActive: true },
    });

    const hasOverlap = existing.some((wh) => startTime < wh.endTime && endTime > wh.startTime);
    if (hasOverlap) {
      throw new ValidationError('Requested availability overlaps with an existing schedule on this day');
    }

    return await DoctorWorkingHour.create({
      doctorId,
      dayOfWeek,
      startTime,
      endTime,
      isActive: true,
    });
  }

  static async updateAvailability(doctorId, availabilityId, { dayOfWeek, startTime, endTime }) {
    const availability = await DoctorWorkingHour.findOne({
      where: { id: availabilityId, doctorId },
    });
    if (!availability) {
      throw new NotFoundError('Availability record not found');
    }

    const targetDay = dayOfWeek !== undefined ? dayOfWeek : availability.dayOfWeek;
    const targetStart = startTime !== undefined ? startTime : availability.startTime;
    const targetEnd = endTime !== undefined ? endTime : availability.endTime;

    if (targetStart >= targetEnd) {
      throw new ValidationError('startTime must be strictly earlier than endTime');
    }

    // Check for overlapping schedule (excluding current record)
    const existing = await DoctorWorkingHour.findAll({
      where: {
        doctorId,
        dayOfWeek: targetDay,
        isActive: true,
        id: { [Op.ne]: availabilityId },
      },
    });

    const hasOverlap = existing.some((wh) => targetStart < wh.endTime && targetEnd > wh.startTime);
    if (hasOverlap) {
      throw new ValidationError('Updated availability overlaps with an existing schedule on this day');
    }

    availability.dayOfWeek = targetDay;
    availability.startTime = targetStart;
    availability.endTime = targetEnd;
    await availability.save();
    return availability;
  }

  static async deleteAvailability(doctorId, availabilityId) {
    const availability = await DoctorWorkingHour.findOne({
      where: { id: availabilityId, doctorId },
    });
    if (!availability) {
      throw new NotFoundError('Availability record not found');
    }

    await availability.destroy();
    return { id: availabilityId };
  }

  static async listAvailability(doctorId) {
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    return await DoctorWorkingHour.findAll({
      where: { doctorId, isActive: true },
      order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']],
    });
  }

  // --- UNAVAILABILITY MANAGEMENT ---

  static async addUnavailability(doctorId, { type, reason, startAt, endAt }) {
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new ValidationError('startAt must be prior to endAt');
    }

    return await DoctorUnavailability.create({
      doctorId,
      type,
      reason,
      startAt: start,
      endAt: end,
    });
  }

  static async listUnavailability(doctorId) {
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    return await DoctorUnavailability.findAll({
      where: { doctorId },
      order: [['startAt', 'ASC']],
    });
  }

  static async deleteUnavailability(doctorId, unavailabilityId) {
    const unavail = await DoctorUnavailability.findOne({
      where: { id: unavailabilityId, doctorId },
    });
    if (!unavail) {
      throw new NotFoundError('Unavailability record not found');
    }

    await unavail.destroy();
    return { id: unavailabilityId };
  }
}

module.exports = DoctorService;
