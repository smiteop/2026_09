const DoctorService = require('../services/doctor.service');
const SlotService = require('../services/slot.service');

class DoctorController {
  static async createDoctor(req, res, next) {
    try {
      const doctor = await DoctorService.createDoctor(req.body);
      res.status(201).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDoctor(req, res, next) {
    try {
      const doctorId = req.params.doctorId || req.params.id;
      const doctor = await DoctorService.updateDoctor(doctorId, req.body);
      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  static async setDoctorStatus(req, res, next) {
    try {
      const doctorId = req.params.doctorId || req.params.id;
      const doctor = await DoctorService.setDoctorStatus(doctorId, req.body.isActive);
      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  static async listDoctors(req, res, next) {
    try {
      const onlyActive = req.user?.role !== 'ADMIN';
      const doctors = await DoctorService.listDoctors({ onlyActive });
      res.status(200).json({
        success: true,
        data: doctors,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDoctorById(req, res, next) {
    try {
      const doctorId = req.params.doctorId || req.params.id;
      const doctor = await DoctorService.getDoctorById(doctorId);
      res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAvailableSlots(req, res, next) {
    try {
      const doctorId = req.params.doctorId || req.params.id;
      const result = await SlotService.getAvailableSlots(doctorId, req.query.date);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DoctorController;
