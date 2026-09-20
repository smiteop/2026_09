const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointment.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { bookAppointmentSchema, cancelAppointmentSchema } = require('../validators/appointment.validator');

router.use(authenticateJWT);

router.post('/', validate(bookAppointmentSchema), AppointmentController.bookAppointment);
router.get('/my', AppointmentController.getMyAppointments);
router.patch('/:appointmentId/cancel', validate(cancelAppointmentSchema), AppointmentController.cancelAppointment);

module.exports = router;
