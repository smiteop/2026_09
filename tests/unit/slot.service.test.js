const SlotService = require('../../src/services/slot.service');
const ClinicService = require('../../src/services/clinic.service');
const { Doctor, DoctorWorkingHour, DoctorUnavailability, Appointment } = require('../../src/models');

jest.mock('../../src/services/clinic.service');
jest.mock('../../src/models', () => ({
  Doctor: { findByPk: jest.fn() },
  DoctorWorkingHour: { findAll: jest.fn() },
  DoctorUnavailability: { findAll: jest.fn() },
  Appointment: { findAll: jest.fn() },
}));

describe('SlotService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generates expected slots in clinic timezone filtering breaks and booked appointments', async () => {
    const doctorId = '11111111-1111-1111-1111-111111111111';
    const dateString = '2026-10-05'; // Monday

    ClinicService.getSettings.mockResolvedValue({ timezone: 'Asia/Kolkata' });

    Doctor.findByPk.mockResolvedValue({
      id: doctorId,
      name: 'Dr. Test',
      slotDurationMinutes: 30,
      isActive: true,
    });

    DoctorWorkingHour.findAll.mockResolvedValue([
      { startTime: '09:00:00', endTime: '11:00:00' },
    ]);

    // Break 10:00 to 10:30 Asia/Kolkata = 04:30 to 05:00 UTC
    const breakStartUTC = new Date('2026-10-05T04:30:00.000Z');
    const breakEndUTC = new Date('2026-10-05T05:00:00.000Z');

    DoctorUnavailability.findAll.mockResolvedValue([
      { startAt: breakStartUTC, endAt: breakEndUTC },
    ]);

    // Booked 09:00 to 09:30 Asia/Kolkata = 03:30 to 04:00 UTC
    const apptStartUTC = new Date('2026-10-05T03:30:00.000Z');
    const apptEndUTC = new Date('2026-10-05T04:00:00.000Z');

    Appointment.findAll.mockResolvedValue([
      { startAt: apptStartUTC, endAt: apptEndUTC },
    ]);

    const result = await SlotService.getAvailableSlots(doctorId, dateString);

    expect(result.doctorId).toBe(doctorId);
    expect(result.date).toBe(dateString);
    expect(result.clinicTimezone).toBe('Asia/Kolkata');
    expect(result.slots).toHaveLength(2);

    expect(result.slots[0].start).toBe('2026-10-05T04:00:00.000Z');
    expect(result.slots[0].end).toBe('2026-10-05T04:30:00.000Z');

    expect(result.slots[1].start).toBe('2026-10-05T05:00:00.000Z');
    expect(result.slots[1].end).toBe('2026-10-05T05:30:00.000Z');
  });
});
