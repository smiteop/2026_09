const { AppError } = require('../utils/errors');

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle PostgreSQL Exclusion Constraint (23P01) and Unique Constraint (23505)
  if (
    err.name === 'SequelizeExclusionConstraintError' ||
    err.original?.code === '23P01' ||
    err.name === 'SequelizeUniqueConstraintError' ||
    err.original?.code === '23505'
  ) {
    statusCode = 409;
    message = 'This appointment slot has already been booked.';
  }

  // Handle Sequelize Validation Errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('UNHANDLED ERROR 💥:', err);
  }

  const responsePayload = {
    success: false,
    message,
  };

  if (errors && errors.length > 0) {
    responsePayload.errors = errors;
  } else {
    responsePayload.errors = [];
  }

  res.status(statusCode).json(responsePayload);
};

module.exports = { globalErrorHandler };
