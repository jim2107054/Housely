import * as videoService from './video.service.js';
import {
  uploadVideoToCloudinary,
  deleteCloudinaryVideo,
} from '../../middlewares/cloudinary.middleware.js';
import { success, error } from '../../utils/response.js';

// ─── Upload Video ───

export const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'No video file uploaded', 400);
    }

    const cloudinaryResult = await uploadVideoToCloudinary(req.file.buffer);
    const video = await videoService.createVideo(req.user.id, req.body, cloudinaryResult);

    return success(res, { video }, 'Video uploaded successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ─── List Videos ───

export const listVideos = async (req, res, next) => {
  try {
    const { page, limit, status, uploaderId, houseId, tag, search } = req.parsedQuery || req.query;
    const isAdmin = req.user?.role === 'ADMIN';

    const result = await videoService.listVideos({
      page,
      limit,
      status,
      uploaderId,
      houseId,
      tag,
      search,
      isAdmin,
    });

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

// ─── Get Video By ID ───

export const getVideoById = async (req, res, next) => {
  try {
    const { id } = req.parsedParams || req.params;
    const video = await videoService.getVideoById(id);

    // Fire-and-forget view tracking if user is authenticated
    if (req.user) {
      videoService.trackVideoView(req.user.id, id, 0).catch(() => {});
    }

    return success(res, { video });
  } catch (err) {
    next(err);
  }
};

// ─── Stream Video ───

export const streamVideo = async (req, res, next) => {
  try {
    const { id } = req.parsedParams || req.params;
    const video = await videoService.getVideoById(id);

    return res.redirect(302, video.url);
  } catch (err) {
    next(err);
  }
};

// ─── Update Video ───

export const updateVideo = async (req, res, next) => {
  try {
    const { id } = req.parsedParams || req.params;
    const video = await videoService.updateVideo(id, req.user.id, req.user.role, req.body);

    return success(res, { video }, 'Video updated successfully');
  } catch (err) {
    next(err);
  }
};

// ─── Delete Video ───

export const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.parsedParams || req.params;
    const { cloudinaryId } = await videoService.deleteVideo(id, req.user.id, req.user.role);

    await deleteCloudinaryVideo(cloudinaryId);

    return success(res, {}, 'Video deleted successfully');
  } catch (err) {
    next(err);
  }
};

// ─── Track View ───

export const trackView = async (req, res, next) => {
  try {
    const { id: videoId } = req.parsedParams || req.params;
    const progress = req.body?.progress ?? 0;

    await videoService.trackVideoView(req.user.id, videoId, progress);

    return success(res, {}, 'View tracked');
  } catch (err) {
    next(err);
  }
};

// ─── List All Users (Admin) ───

export const listAllUsers = async (req, res, next) => {
  try {
    const { page, limit, role } = req.parsedQuery || req.query;

    const result = await videoService.getAdminUserList(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      role,
    );

    return success(res, result);
  } catch (err) {
    next(err);
  }
};

// ─── Get Watch History ───

export const getWatchHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await videoService.getWatchHistory(req.user.id, page, limit);

    return success(res, result);
  } catch (err) {
    next(err);
  }
};
