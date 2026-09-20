const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ClinicSetting = sequelize.define('ClinicSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1,
    },
    clinicName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: 'Default Medical Clinic',
      field: 'clinic_name',
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Asia/Kolkata', // Default IANA timezone
    },
  }, {
    tableName: 'clinic_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return ClinicSetting;
};
