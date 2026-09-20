const DoctorService = require('../services/doctor.service');

class UnavailabilityController {
  static async addUnavailability(req, res, next) {
    try {
      const result = await DoctorService.addUnavailability(req.params.doctorId, req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async listUnavailability(req, res, next) {
    try {
      const result = await DoctorService.listUnavailability(req.params.doctorId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUnavailability(req, res, next) {
    try {
      const result = await DoctorService.deleteUnavailability(
        req.params.doctorId,
        req.params.unavailabilityId
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UnavailabilityController;
