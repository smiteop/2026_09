const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

/**
 * Authentication Middleware: Extracts and validates JWT token from Authorization header.
 * Attaches decoded payload (id, email, role) to req.user.
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication token missing or malformed'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
};

/**
 * Role Authorization Middleware: Guarantees that req.user has one of the allowed roles.
 * Must be executed AFTER authenticateJWT.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new UnauthorizedError('User authentication details not found'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Access denied: Requires one of [${allowedRoles.join(', ')}] role(s)`));
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles,
};
