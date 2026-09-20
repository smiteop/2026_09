const { z } = require('zod');
const { isValidIANATimezone } = require('../utils/timezone');

const updateTimezoneSchema = z.object({
  body: z.object({
    timezone: z.string().refine((val) => isValidIANATimezone(val), {
      message: 'Invalid IANA timezone (e.g. Asia/Kolkata, America/New_York)',
    }),
  }),
});

module.exports = {
  updateTimezoneSchema,
};
