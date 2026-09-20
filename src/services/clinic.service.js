const { ClinicSetting } = require('../models');
const { isValidIANATimezone } = require('../utils/timezone');
const { ValidationError } = require('../utils/errors');

class ClinicService {
  static async getSettings() {
    let [settings] = await ClinicSetting.findOrCreate({
      where: { id: 1 },
      defaults: {
        clinicName: 'Default Medical Clinic',
        timezone: 'Asia/Kolkata',
      },
    });
    return settings;
  }

  static async updateSettings({ clinicName, timezone }) {
    if (timezone && !isValidIANATimezone(timezone)) {
      throw new ValidationError(`Invalid IANA timezone: '${timezone}'. Must be a valid identifier like 'Asia/Kolkata' or 'America/New_York'`);
    }

    let settings = await this.getSettings();
    if (clinicName) settings.clinicName = clinicName;
    if (timezone) settings.timezone = timezone;

    await settings.save();
    return settings;
  }
}

module.exports = ClinicService;
