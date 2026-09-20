const { z } = require('zod');

const createUnavailabilitySchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor UUID'),
  }),
  body: z.object({
    type: z.enum(['BREAK', 'LEAVE', 'MEETING', 'HOLIDAY', 'OTHER']),
    reason: z.string().optional(),
    startAt: z.string().datetime({ message: 'startAt must be a valid ISO-8601 UTC timestamp' }),
    endAt: z.string().datetime({ message: 'endAt must be a valid ISO-8601 UTC timestamp' }),
  }),
});

const listUnavailabilitySchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor UUID'),
  }),
});

const deleteUnavailabilitySchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('Invalid doctor UUID'),
    unavailabilityId: z.string().uuid('Invalid unavailability UUID'),
  }),
});

module.exports = {
  createUnavailabilitySchema,
  listUnavailabilitySchema,
  deleteUnavailabilitySchema,
};
