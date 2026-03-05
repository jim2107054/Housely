import redis from '../config/redis.js';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = async (identifier, otp, ttlSeconds = 600) => {
  await redis.set(`otp:${identifier}`, otp, 'EX', ttlSeconds);
};

export const verifyOTP = async (identifier, otp) => {
  const stored = await redis.get(`otp:${identifier}`);
  if (!stored) return false;
  if (stored !== otp) return false;
  await redis.del(`otp:${identifier}`);
  return true;
};
