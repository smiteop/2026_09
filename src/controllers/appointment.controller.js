const BookingService = require('../services/booking.service');

class AppointmentController {
  static async bookAppointment(req, res, next) {
    try {
      const appointment = await BookingService.bookAppointment({
        doctorId: req.body.doctorId,
        userId: req.user.id,
        startAt: req.body.startAt,
        startTime: req.body.startTime,
        notes: req.body.notes,
      });

      res.status(201).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyAppointments(req, res, next) {
    try {
      const appointments = await BookingService.getUserAppointments(req.user.id);
      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelAppointment(req, res, next) {
    try {
      const appointmentId = req.params.appointmentId || req.params.id;
      const appointment = await BookingService.cancelAppointment(
        appointmentId,
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AppointmentController;
