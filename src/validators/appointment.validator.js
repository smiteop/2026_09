const { z } = require('zod');

const bookAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().uuid('doctorId must be a valid UUID'),
    startAt: z.string().datetime({ message: 'startAt must be a valid ISO-8601 UTC timestamp' }).optional(),
    startTime: z.string().datetime({ message: 'startTime must be a valid ISO-8601 UTC timestamp' }).optional(),
    notes: z.string().optional(),
  }).refine((data) => data.startAt || data.startTime, {
    message: 'Either startAt or startTime ISO-8601 timestamp must be provided',
    path: ['startAt'],
  }),
});

const cancelAppointmentSchema = z.object({
  params: z.object({
    appointmentId: z.string().uuid('Invalid appointment UUID'),
  }),
});

module.exports = {
  bookAppointmentSchema,
  cancelAppointmentSchema,
};
