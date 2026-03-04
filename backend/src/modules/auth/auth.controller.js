import * as authService from './auth.service.js';
import { success } from '../../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    // Include `token` at top level for mobile app backward compatibility
    return success(
      res,
      {
        user: result.user,
        token: result.accessToken,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      'Registration successful',
      201,
    );
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return success(res, {
      user: result.user,
      token: result.accessToken,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    return success(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    return success(res, {}, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordEmail = async (req, res, next) => {
  try {
    const result = await authService.forgotPasswordEmail(req.body.email);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

export const forgotPasswordPhone = async (req, res, next) => {
  try {
    const result = await authService.forgotPasswordPhone(req.body.phoneNumber);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const result = await authService.verifyOTPCode(req.body.identifier, req.body.otp);
    return success(res, result, 'OTP verified successfully');
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body.identifier, req.body.newPassword);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};
