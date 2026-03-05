import { verifyAccessToken } from '../utils/jwt.js';
import prisma from '../config/prisma.js';
import { error } from '../utils/response.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return error(res, 'Not authorized, no token', 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phoneNumber: true,
        isVerified: true,
      },
    });

    if (!user) {
      return error(res, 'Not authorized, user not found', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 'Not authorized, token failed', 401);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, 'Insufficient permissions', 403);
    }
    next();
  };
};
