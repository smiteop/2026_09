const express = require('express');
const router = express.Router();
const DoctorController = require('../controllers/doctor.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { getSlotsSchema } = require('../validators/doctor.validator');

// Requires authentication
router.get('/', authenticateJWT, DoctorController.listDoctors);
router.get('/:doctorId/slots', authenticateJWT, validate(getSlotsSchema), DoctorController.getAvailableSlots);

module.exports = router;
