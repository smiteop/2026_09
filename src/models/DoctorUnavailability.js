const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DoctorUnavailability = sequelize.define('DoctorUnavailability', {
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
    type: {
      type: DataTypes.ENUM('BREAK', 'LEAVE', 'MEETING', 'HOLIDAY', 'OTHER'),
      allowNull: false,
      defaultValue: 'OTHER',
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
  }, {
    tableName: 'doctor_unavailabilities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return DoctorUnavailability;
};
