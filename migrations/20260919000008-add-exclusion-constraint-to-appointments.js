'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. PostgreSQL Unique Index on (doctor_id, start_at) for SCHEDULED appointments
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_active_doctor_appointment_slot
      ON appointments (doctor_id, start_at)
      WHERE (status = 'SCHEDULED');
    `);

    // 2. PostgreSQL Exclusion Constraint for interval range overlap using btree_gist
    await queryInterface.sequelize.query(`
      ALTER TABLE appointments
      ADD CONSTRAINT no_overlapping_doctor_appointments
      EXCLUDE USING gist (
        doctor_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
      )
      WHERE (status IN ('SCHEDULED', 'COMPLETED'));
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE appointments DROP CONSTRAINT IF EXISTS no_overlapping_doctor_appointments;
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS unique_active_doctor_appointment_slot;
    `);
  }
};
