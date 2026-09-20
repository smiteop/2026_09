const express = require('express');
const router = express.Router();
const ClinicController = require('../controllers/clinic.controller');
const DoctorController = require('../controllers/doctor.controller');
const AvailabilityController = require('../controllers/availability.controller');
const UnavailabilityController = require('../controllers/unavailability.controller');

const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { updateTimezoneSchema } = require('../validators/clinic.validator');
const {
  createDoctorSchema,
  updateDoctorSchema,
  updateDoctorStatusSchema,
  getDoctorByIdSchema,
} = require('../validators/doctor.validator');
const {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  deleteAvailabilitySchema,
  listAvailabilitySchema,
} = require('../validators/availability.validator');
const {
  createUnavailabilitySchema,
  listUnavailabilitySchema,
  deleteUnavailabilitySchema,
} = require('../validators/unavailability.validator');

// All Admin routes require JWT authentication + ADMIN role
router.use(authenticateJWT);
router.use(authorizeRoles('ADMIN'));

// Clinic Settings
router.put('/settings/timezone', validate(updateTimezoneSchema), ClinicController.updateTimezone);

// Doctor Management
router.post('/doctors', validate(createDoctorSchema), DoctorController.createDoctor);
router.get('/doctors', DoctorController.listDoctors);
router.get('/doctors/:doctorId', validate(getDoctorByIdSchema), DoctorController.getDoctorById);
router.patch('/doctors/:doctorId', validate(updateDoctorSchema), DoctorController.updateDoctor);
router.patch('/doctors/:doctorId/status', validate(updateDoctorStatusSchema), DoctorController.setDoctorStatus);

// Doctor Availability Management
router.post('/doctors/:doctorId/availability', validate(createAvailabilitySchema), AvailabilityController.addAvailability);
router.get('/doctors/:doctorId/availability', validate(listAvailabilitySchema), AvailabilityController.listAvailability);
router.put('/doctors/:doctorId/availability/:availabilityId', validate(updateAvailabilitySchema), AvailabilityController.updateAvailability);
router.delete('/doctors/:doctorId/availability/:availabilityId', validate(deleteAvailabilitySchema), AvailabilityController.deleteAvailability);

// Doctor Unavailability Management
router.post('/doctors/:doctorId/unavailability', validate(createUnavailabilitySchema), UnavailabilityController.addUnavailability);
router.get('/doctors/:doctorId/unavailability', validate(listUnavailabilitySchema), UnavailabilityController.listUnavailability);
router.delete('/doctors/:doctorId/unavailability/:unavailabilityId', validate(deleteUnavailabilitySchema), UnavailabilityController.deleteUnavailability);

module.exports = router;
