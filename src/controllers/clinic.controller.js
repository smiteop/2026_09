const ClinicService = require('../services/clinic.service');

class ClinicController {
  static async getSettings(req, res, next) {
    try {
      const settings = await ClinicService.getSettings();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTimezone(req, res, next) {
    try {
      const updated = await ClinicService.updateSettings({ timezone: req.body.timezone });
      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ClinicController;
