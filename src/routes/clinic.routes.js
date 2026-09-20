const express = require('express');
const router = express.Router();
const ClinicController = require('../controllers/clinic.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth.middleware');
const { validateUpdateClinicSettings } = require('../validators/clinic.validator');
const { validate } = require('../middleware/validate.middleware');

router.get('/settings', authenticateJWT, ClinicController.getSettings);
router.put('/settings', authenticateJWT, authorizeRoles('ADMIN'), validateUpdateClinicSettings, validate, ClinicController.updateSettings);

module.exports = router;
