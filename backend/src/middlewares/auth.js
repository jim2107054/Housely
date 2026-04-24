import { getAuth } from '@clerk/express';
import prisma from '../config/prisma.js';
import { error } from '../utils/response.js';

export const protect = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return error(res, 'Not authorized, no session', 401);
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
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
      return error(res, 'Not authorized, user profile not found. Please sync your account.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 'Not authorized', 401);
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
