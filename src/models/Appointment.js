const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    doctorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'doctor_id',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    startAt: {
      type: DataTypes.DATE, // TIMESTAMPTZ
      allowNull: false,
      field: 'start_at',
    },
    endAt: {
      type: DataTypes.DATE, // TIMESTAMPTZ
      allowNull: false,
      field: 'end_at',
    },
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'SCHEDULED',
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'appointments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Appointment;
};
