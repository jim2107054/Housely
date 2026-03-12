import * as userService from './user.service.js';
import { success } from '../../utils/response.js';
import env from '../../config/env.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    return success(res, { user }, 'Profile updated');
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let finalUrl;

    if (env.CLOUDINARY_CLOUD_NAME) {
      // Upload to Cloudinary
      const { v2: cloudinary } = await import('cloudinary');
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'housely/avatars', public_id: req.user.id },
          (error, result) => (error ? reject(error) : resolve(result)),
        );
        stream.end(req.file.buffer);
      });
      finalUrl = result.secure_url;
    } else {
      // Fallback: base64 data URL (dev only)
      const base64 = req.file.buffer.toString('base64');
      finalUrl = `data:${req.file.mimetype};base64,${base64}`;
    }

    const user = await userService.uploadAvatar(req.user.id, finalUrl);
    return success(res, { user }, 'Avatar uploaded');
  } catch (err) {
    next(err);
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await userService.getPaymentHistory(req.user.id, page, limit);
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

export const getNotificationSettings = async (req, res, next) => {
  try {
    const settings = await userService.getNotificationSettings(req.user.id);
    return success(res, { settings });
  } catch (err) {
    next(err);
  }
};

export const updateNotificationSettings = async (req, res, next) => {
  try {
    const settings = await userService.updateNotificationSettings(req.user.id, req.body);
    return success(res, { settings }, 'Notification settings updated');
  } catch (err) {
    next(err);
  }
};

export const getRecentViewed = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const houses = await userService.getRecentViewed(req.user.id, limit);
    return success(res, { houses });
  } catch (err) {
    next(err);
  }
};
