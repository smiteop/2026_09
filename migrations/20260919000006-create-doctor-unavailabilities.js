'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('doctor_unavailabilities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'doctors',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('BREAK', 'LEAVE', 'MEETING', 'HOLIDAY', 'OTHER'),
        allowNull: false,
        defaultValue: 'OTHER',
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      start_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('doctor_unavailabilities', ['doctor_id', 'start_at', 'end_at'], {
      name: 'idx_doctor_unavailabilities_lookup',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('doctor_unavailabilities');
  }
};
