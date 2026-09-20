const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DoctorWorkingHour = sequelize.define('DoctorWorkingHour', {
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
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'day_of_week',
      validate: {
        min: 0,
        max: 6,
      },
      comment: '0 = Sunday, 1 = Monday, ..., 6 = Saturday',
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'start_time',
      comment: 'Local clinic wall-clock time, e.g., 09:00:00',
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'end_time',
      comment: 'Local clinic wall-clock time, e.g., 13:00:00',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  }, {
    tableName: 'doctor_working_hours',
    timestamps: false,
  });

  return DoctorWorkingHour;
};
