const { IANAZone, DateTime } = require('luxon');

/**
 * Validates if a string is a valid IANA timezone name.
 * e.g., 'Asia/Kolkata', 'America/New_York', 'UTC'
 */
const isValidIANATimezone = (tz) => {
  if (!tz || typeof tz !== 'string') return false;
  return IANAZone.isValidZone(tz);
};

/**
 * Parses a date string (YYYY-MM-DD) and a time string (HH:mm:ss or HH:mm) in a target timezone
 * and returns the corresponding JS Date object (UTC).
 */
const parseLocalTimeToUTC = (dateStr, timeStr, timeZone) => {
  const isoCombined = `${dateStr}T${timeStr}`;
  const dt = DateTime.fromISO(isoCombined, { zone: timeZone });
  if (!dt.isValid) {
    throw new Error(`Invalid local date/time string: ${isoCombined} in timezone ${timeZone}`);
  }
  return dt.toJSDate();
};

/**
 * Formats a UTC Date to an ISO-8601 string.
 */
const toISOUTCString = (date) => {
  return new Date(date).toISOString();
};

module.exports = {
  isValidIANATimezone,
  parseLocalTimeToUTC,
  toISOUTCString,
};
