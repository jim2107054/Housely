import redis from '../config/redis.js';
import { error } from '../utils/response.js';

export const rateLimiter = (maxRequests = 5, windowSeconds = 60) => {
  return async (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const key = `ratelimit:${req.originalUrl}:${ip}`;

    try {
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        return error(res, 'Too many requests, please try again later', 429);
      }

      next();
    } catch (err) {
      // If rate limiting fails, allow the request through
      next();
    }
  };
};
