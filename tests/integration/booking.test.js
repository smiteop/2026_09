const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Doctor, DoctorWorkingHour, DoctorUnavailability, Appointment, ClinicSetting } = require('../../src/models');

describe('Doctor Booking System - Integration & Concurrency Tests', () => {
  let adminToken;
  let userToken1;
  let userToken2;
  let adminUser;
  let patientUser1;
  let patientUser2;
  let doctorId;

  beforeAll(async () => {
    // Force sync database for integration testing environment
    await sequelize.sync({ force: true });
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS btree_gist;');
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_active_doctor_appointment_slot
      ON appointments (doctor_id, start_at)
      WHERE (status = 'SCHEDULED');
    `);
    await sequelize.query(`
      ALTER TABLE appointments DROP CONSTRAINT IF EXISTS no_overlapping_doctor_appointments;
      ALTER TABLE appointments
      ADD CONSTRAINT no_overlapping_doctor_appointments
      EXCLUDE USING gist (
        doctor_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
      )
      WHERE (status IN ('SCHEDULED', 'COMPLETED'));
    `);

    // Setup Clinic Settings
    await ClinicSetting.create({
      id: 1,
      clinicName: 'Test Medical Clinic',
      timezone: 'Asia/Kolkata',
    });

    // 1. Register Admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin Test',
        email: 'admin@test.com',
        password: 'Password123!',
        role: 'ADMIN',
      });
    expect(adminRes.statusCode).toBe(201);
    adminToken = adminRes.body.data.token;
    adminUser = adminRes.body.data.user;

    // 2. Register Patient 1
    const user1Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'user1@test.com',
        password: 'Password123!',
        role: 'USER',
      });
    expect(user1Res.statusCode).toBe(201);
    userToken1 = user1Res.body.data.token;
    patientUser1 = user1Res.body.data.user;

    // 3. Register Patient 2
    const user2Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'user2@test.com',
        password: 'Password123!',
        role: 'USER',
      });
    expect(user2Res.statusCode).toBe(201);
    userToken2 = user2Res.body.data.token;
    patientUser2 = user2Res.body.data.user;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('ADMIN can update clinic timezone', async () => {
    const res = await request(app)
      .put('/api/admin/settings/timezone')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ timezone: 'Asia/Kolkata' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.timezone).toBe('Asia/Kolkata');
  });

  test('USER cannot access ADMIN endpoints (Authorization check)', async () => {
    const res = await request(app)
      .post('/api/admin/doctors')
      .set('Authorization', `Bearer ${userToken1}`)
      .send({
        name: 'Dr. Unauthorized',
        specialization: 'General',
        email: 'unauth@test.com',
        phone: '12345678',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('ADMIN creates a Doctor', async () => {
    const res = await request(app)
      .post('/api/admin/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dr. Gregory House',
        specialization: 'Diagnostics',
        email: 'house@test.com',
        phone: '+1-555-0199',
        slotDurationMinutes: 30,
        isActive: true,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    doctorId = res.body.data.id;
  });

  test('ADMIN configures doctor availability (recurring weekly hours)', async () => {
    // Add Monday 09:00 - 13:00 (dayOfWeek = 1)
    const res = await request(app)
      .post(`/api/admin/doctors/${doctorId}/availability`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        dayOfWeek: 1, // Monday
        startTime: '09:00:00',
        endTime: '13:00:00',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('Rejects overlapping availability configuration', async () => {
    // Try to add Monday 10:00 - 12:00 (overlaps with 09:00-13:00)
    const res = await request(app)
      .post(`/api/admin/doctors/${doctorId}/availability`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        dayOfWeek: 1,
        startTime: '10:00:00',
        endTime: '12:00:00',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('ADMIN configures doctor unavailability (Break)', async () => {
    // Break on 2026-10-05 between 10:00 and 10:30 Asia/Kolkata (04:30 to 05:00 UTC)
    const res = await request(app)
      .post(`/api/admin/doctors/${doctorId}/unavailability`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        type: 'BREAK',
        reason: 'Tea break',
        startAt: '2026-10-05T04:30:00.000Z',
        endAt: '2026-10-05T05:00:00.000Z',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('Rejects booking in the past', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${userToken1}`)
      .send({
        doctorId,
        startAt: '2020-01-01T04:00:00.000Z',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Rejects booking outside working hours', async () => {
    // Requested slot 15:00 Asia/Kolkata = 09:30 UTC on 2026-10-05 (Working hours are 09:00-13:00 local time)
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${userToken1}`)
      .send({
        doctorId,
        startAt: '2026-10-05T09:30:00.000Z',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('Rejects booking during doctor unavailability break', async () => {
    // Break is 04:30 to 05:00 UTC (10:00-10:30 local)
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${userToken1}`)
      .send({
        doctorId,
        startAt: '2026-10-05T04:30:00.000Z',
      });

    expect(res.statusCode).toBe(409); // Conflict with unavailability
    expect(res.body.success).toBe(false);
  });

  test('Concurrent Booking Test: Two users attempt to book the exact same slot simultaneously', async () => {
    // Slot: Monday 09:30 AM Asia/Kolkata = 2026-10-05T04:00:00.000Z (Within 09:00-13:00 working hours)
    const slotTimestamp = '2026-10-05T04:00:00.000Z';

    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${userToken1}`)
        .send({ doctorId, startAt: slotTimestamp }),
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${userToken2}`)
        .send({ doctorId, startAt: slotTimestamp }),
    ]);

    const statusCodes = [res1.statusCode, res2.statusCode].sort();

    // Verify exactly one 201 Created and one 409 Conflict
    expect(statusCodes).toEqual([201, 409]);

    const conflictRes = res1.statusCode === 409 ? res1 : res2;
    expect(conflictRes.body.success).toBe(false);
    expect(conflictRes.body.message).toBe('This appointment slot has already been booked.');

    // Verify in database that exactly 1 appointment record exists for this slot
    const dbAppointments = await Appointment.findAll({
      where: {
        doctorId,
        startAt: new Date(slotTimestamp),
        status: 'SCHEDULED',
      },
    });

    expect(dbAppointments).toHaveLength(1);
  });
});
