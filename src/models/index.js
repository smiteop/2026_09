const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config')[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Load Models
const User = require('./User')(sequelize);
const ClinicSetting = require('./ClinicSetting')(sequelize);
const Doctor = require('./Doctor')(sequelize);
const DoctorWorkingHour = require('./DoctorWorkingHour')(sequelize);
const DoctorUnavailability = require('./DoctorUnavailability')(sequelize);
const Appointment = require('./Appointment')(sequelize);

// Associations
Doctor.hasMany(DoctorWorkingHour, { foreignKey: 'doctor_id', as: 'availabilities', onDelete: 'CASCADE' });
DoctorWorkingHour.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

Doctor.hasMany(DoctorUnavailability, { foreignKey: 'doctor_id', as: 'unavailabilities', onDelete: 'CASCADE' });
DoctorUnavailability.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

User.hasMany(Appointment, { foreignKey: 'user_id', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'user_id', as: 'patient' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  ClinicSetting,
  Doctor,
  DoctorWorkingHour,
  DoctorUnavailability,
  Appointment,
};
