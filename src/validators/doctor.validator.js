const { z } = require('zod');

const createDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Doctor name is required'),
    specialization: z.string().min(1, 'Specialization is required'),
    email: z.string().email('Valid email address is required'),
    phone: z.string().min(5, 'Valid phone number is required'),
    slotDurationMinutes: z.number().int().min(5).max(240).default(30),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateDoctorSchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor UUID'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    specialization: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
    slotDurationMinutes: z.number().int().min(5).max(240).optional(),
    isActive: z.boolean().optional(),
  }),
});

const updateDoctorStatusSchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor UUID'),
  }),
  body: z.object({
    isActive: z.boolean({ required_error: 'isActive boolean is required' }),
  }),
});

const getDoctorByIdSchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor UUID'),
  }),
});

const getSlotsSchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor UUID'),
  }),
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  }),
});

module.exports = {
  createDoctorSchema,
  updateDoctorSchema,
  updateDoctorStatusSchema,
  getDoctorByIdSchema,
  getSlotsSchema,
};
