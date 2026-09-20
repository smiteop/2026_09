'use strict';
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const adminId = '11111111-1111-1111-1111-111111111111';
    const userId1 = '22222222-2222-2222-2222-222222222222';
    const userId2 = '22222222-2222-2222-2222-333333333333';
    const userId3 = '22222222-2222-2222-2222-444444444444';

    // 1. Seed Users
    await queryInterface.bulkInsert('users', [
      {
        id: adminId,
        name: 'System Administrator',
        email: 'admin@clinic.com',
        password_hash: passwordHash,
        role: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: userId1,
        name: 'John Patient',
        email: 'user@clinic.com',
        password_hash: passwordHash,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: userId2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password_hash: passwordHash,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: userId3,
        name: 'Alex Johnson',
        email: 'alex.j@example.com',
        password_hash: passwordHash,
        role: 'USER',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});

    // 2. Seed Clinic Settings
    await queryInterface.bulkInsert('clinic_settings', [
      {
        id: 1,
        clinic_name: 'Metro Care Super-Specialty Medical Center',
        timezone: 'Asia/Kolkata',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});

    // 3. Seed Doctors
    const doctors = [
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Dr. Sarah Jenkins',
        specialization: 'Cardiology',
        email: 'dr.sarah@clinic.com',
        phone: '+1-555-0192',
        slot_duration_minutes: 30,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Dr. Robert Chen',
        specialization: 'Dermatology',
        email: 'dr.robert@clinic.com',
        phone: '+1-555-0193',
        slot_duration_minutes: 20,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Dr. Emily Rodriguez',
        specialization: 'Pediatrics',
        email: 'dr.emily@clinic.com',
        phone: '+1-555-0194',
        slot_duration_minutes: 30,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        name: 'Dr. Michael Vance',
        specialization: 'Neurology',
        email: 'dr.michael@clinic.com',
        phone: '+1-555-0195',
        slot_duration_minutes: 45,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        name: 'Dr. Priya Sharma',
        specialization: 'General Medicine',
        email: 'dr.priya@clinic.com',
        phone: '+1-555-0196',
        slot_duration_minutes: 15,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('doctors', doctors, {});

    // 4. Seed Doctor Working Hours (Mon - Fri: Morning & Afternoon shifts for all doctors)
    const workingHours = [];
    doctors.forEach((doc) => {
      for (let day = 1; day <= 5; day++) { // 1 = Monday to 5 = Friday
        workingHours.push({
          id: crypto.randomUUID(),
          doctor_id: doc.id,
          day_of_week: day,
          start_time: '09:00:00',
          end_time: '13:00:00',
          is_active: true,
        });
        workingHours.push({
          id: crypto.randomUUID(),
          doctor_id: doc.id,
          day_of_week: day,
          start_time: '14:00:00',
          end_time: '18:00:00',
          is_active: true,
        });
      }
    });

    await queryInterface.bulkInsert('doctor_working_hours', workingHours, {});

    // 5. Seed Sample Doctor Unavailabilities (Breaks & Meetings)
    await queryInterface.bulkInsert('doctor_unavailabilities', [
      {
        id: crypto.randomUUID(),
        doctor_id: doctors[0].id,
        type: 'BREAK',
        reason: 'Lunch break',
        start_at: new Date('2026-10-05T04:30:00.000Z'),
        end_at: new Date('2026-10-05T05:00:00.000Z'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        doctor_id: doctors[1].id,
        type: 'MEETING',
        reason: 'Departmental Sync',
        start_at: new Date('2026-10-05T05:00:00.000Z'),
        end_at: new Date('2026-10-05T06:00:00.000Z'),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});

    // 6. Seed Sample Appointments
    await queryInterface.bulkInsert('appointments', [
      {
        id: crypto.randomUUID(),
        doctor_id: doctors[0].id,
        user_id: userId1,
        start_at: new Date('2026-10-05T03:30:00.000Z'),
        end_at: new Date('2026-10-05T04:00:00.000Z'),
        status: 'SCHEDULED',
        notes: 'Routine Cardiology Consultation',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: crypto.randomUUID(),
        doctor_id: doctors[2].id,
        user_id: userId2,
        start_at: new Date('2026-10-05T04:00:00.000Z'),
        end_at: new Date('2026-10-05T04:30:00.000Z'),
        status: 'SCHEDULED',
        notes: 'Pediatric checkup for toddler',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('appointments', null, {});
    await queryInterface.bulkDelete('doctor_unavailabilities', null, {});
    await queryInterface.bulkDelete('doctor_working_hours', null, {});
    await queryInterface.bulkDelete('doctors', null, {});
    await queryInterface.bulkDelete('clinic_settings', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
