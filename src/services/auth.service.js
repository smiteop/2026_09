const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { UnauthorizedError, ConflictError } = require('../utils/errors');

class AuthService {
  static async registerUser({ name, email, password, role = 'USER' }) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async loginUser({ email, password }) {
    // Explicitly scope in withPassword to retrieve passwordHash for comparison
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

module.exports = AuthService;
