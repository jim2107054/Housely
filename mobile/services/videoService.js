import api from './api';

/**
 * Fetch a paginated list of videos.
 * @param {object} params - Query params (page, limit, etc.)
 */
export const fetchVideos = (params) => {
  return api.get('/api/videos', { params });
};

/**
 * Fetch a single video by ID.
 * @param {string} id
 */
export const fetchVideoById = (id) => {
  return api.get(`/api/videos/${id}`);
};

/**
 * Upload a video as multipart/form-data.
 * @param {FormData} formData
 * @param {function} onUploadProgress - axios progress callback
 */
export const uploadVideo = (formData, onUploadProgress) => {
  return api.post('/api/videos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
    timeout: 300000, // 5 minutes for large uploads
  });
};

/**
 * Update video metadata.
 * @param {string} id
 * @param {object} data
 */
export const updateVideo = (id, data) => {
  return api.patch(`/api/videos/${id}`, data);
};

/**
 * Delete a video by ID.
 * @param {string} id
 */
export const deleteVideo = (id) => {
  return api.delete(`/api/videos/${id}`);
};

/**
 * Track a video view with current playback progress.
 * @param {string} id
 * @param {number} progress - playback progress in seconds
 */
export const trackView = (id, progress) => {
  return api.post(`/api/videos/${id}/view`, { progress });
};

/**
 * Fetch the authenticated user's watch history.
 * @param {number} page
 */
export const fetchWatchHistory = (page) => {
  return api.get(`/api/videos/me/watch-history?page=${page}`);
};
