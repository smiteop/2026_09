const { z } = require('zod');

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const createAvailabilitySchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor UUID'),
  }),
  body: z.object({
    dayOfWeek: z.number().int().min(0).max(6, 'dayOfWeek must be between 0 (Sunday) and 6 (Saturday)'),
    startTime: z.string().regex(timeRegex, 'startTime must be in HH:mm or HH:mm:ss format'),
    endTime: z.string().regex(timeRegex, 'endTime must be in HH:mm or HH:mm:ss format'),
  }),
});

const updateAvailabilitySchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor UUID'),
    availabilityId: z.string().uuid('Invalid availability UUID'),
  }),
  body: z.object({
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTime: z.string().regex(timeRegex).optional(),
    endTime: z.string().regex(timeRegex).optional(),
  }),
});

const deleteAvailabilitySchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor UUID'),
    availabilityId: z.string().uuid('Invalid availability UUID'),
  }),
});

const listAvailabilitySchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor UUID'),
  }),
});

module.exports = {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  deleteAvailabilitySchema,
  listAvailabilitySchema,
};
