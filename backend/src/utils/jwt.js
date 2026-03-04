import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import redis from '../config/redis.js';

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

/** Store refresh token in Redis with 7-day TTL */
export const storeRefreshToken = async (userId, token) => {
  await redis.set(`refresh:${userId}`, token, 'EX', 7 * 24 * 60 * 60);
};

/** Get stored refresh token */
export const getStoredRefreshToken = async (userId) => {
  return await redis.get(`refresh:${userId}`);
};

/** Blacklist a refresh token (on logout) */
export const blacklistRefreshToken = async (userId) => {
  await redis.del(`refresh:${userId}`);
};
