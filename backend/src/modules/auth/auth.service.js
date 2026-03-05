import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import redis from '../../config/redis.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  storeRefreshToken,
  getStoredRefreshToken,
  blacklistRefreshToken,
} from '../../utils/jwt.js';
import { generateOTP, storeOTP, verifyOTP as verifyStoredOTP } from '../../utils/otp.js';
import { sendEmail } from '../../utils/email.js';
import { sendSMS } from '../../utils/sms.js';

const SALT_ROUNDS = 10;

// ─── Register ───

export const register = async ({ username, email, password }) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    const field = existing.email === email ? 'email' : 'username';
    throw Object.assign(new Error(`User with this ${field} already exists`), { statusCode: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  await storeRefreshToken(user.id, refreshToken);

  // Send verification OTP (fire-and-forget)
  const otp = generateOTP();
  await storeOTP(email, otp);
  sendEmail(email, 'Verify your Housely account', `Your verification code is: ${otp}`).catch(console.error);

  return { user, accessToken, refreshToken };
};

// ─── Login ───

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.password) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  await storeRefreshToken(user.id, refreshToken);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
    accessToken,
    refreshToken,
  };
};

// ─── Refresh Token ───

export const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  const storedToken = await getStoredRefreshToken(decoded.id);
  if (!storedToken || storedToken !== refreshToken) {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }

  const newAccessToken = generateAccessToken(decoded.id);
  const newRefreshToken = generateRefreshToken(decoded.id);
  await storeRefreshToken(decoded.id, newRefreshToken);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// ─── Logout ───

export const logout = async (userId) => {
  await blacklistRefreshToken(userId);
};

// ─── Forgot Password (Email) ───

export const forgotPasswordEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw Object.assign(new Error('No account found with this email'), { statusCode: 404 });
  }

  const otp = generateOTP();
  await storeOTP(email, otp, 600);
  await sendEmail(email, 'Password Reset — Housely', `Your password reset OTP is: ${otp}. It expires in 10 minutes.`);

  return { message: 'OTP sent to your email' };
};

// ─── Forgot Password (Phone) ───

export const forgotPasswordPhone = async (phoneNumber) => {
  const user = await prisma.user.findFirst({ where: { phoneNumber } });
  if (!user) {
    throw Object.assign(new Error('No account found with this phone number'), { statusCode: 404 });
  }

  const otp = generateOTP();
  await storeOTP(phoneNumber, otp, 600);
  await sendSMS(phoneNumber, `Your Housely password reset OTP is: ${otp}`);

  return { message: 'OTP sent to your phone' };
};

// ─── Verify OTP ───

export const verifyOTPCode = async (identifier, otp) => {
  const valid = await verifyStoredOTP(identifier, otp);
  if (!valid) {
    throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 400 });
  }

  // Store a short-lived reset token so user can proceed to reset password
  const resetToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
  await redis.set(`reset:${identifier}`, resetToken, 'EX', 600);

  return { resetToken };
};

// ─── Reset Password ───

export const resetPassword = async (identifier, newPassword) => {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { phoneNumber: identifier }] },
  });

  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await redis.del(`reset:${identifier}`);
  await blacklistRefreshToken(user.id);

  return { message: 'Password reset successfully' };
};
