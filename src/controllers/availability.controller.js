const DoctorService = require('../services/doctor.service');

class AvailabilityController {
  static async addAvailability(req, res, next) {
    try {
      const result = await DoctorService.addAvailability(req.params.doctorId, req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAvailability(req, res, next) {
    try {
      const result = await DoctorService.updateAvailability(
        req.params.doctorId,
        req.params.availabilityId,
        req.body
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAvailability(req, res, next) {
    try {
      const result = await DoctorService.deleteAvailability(
        req.params.doctorId,
        req.params.availabilityId
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async listAvailability(req, res, next) {
    try {
      const result = await DoctorService.listAvailability(req.params.doctorId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AvailabilityController;
