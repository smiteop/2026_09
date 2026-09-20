const { ValidationError } = require('../utils/errors');

/**
 * Higher-order middleware to validate incoming request data using Zod schema.
 */
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const formattedErrors = error.errors.map((e) => ({
          field: e.path.join('.').replace(/^(body|query|params)\./, ''),
          message: e.message,
        }));
        return next(
          new ValidationError(
            formattedErrors[0]?.message || 'Validation failed',
            formattedErrors
          )
        );
      }
      next(error);
    }
  };
};

module.exports = { validate };
