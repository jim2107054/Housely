import { create } from 'zustand';
import {
  fetchVideos as fetchVideosService,
  fetchVideoById as fetchVideoByIdService,
  uploadVideo as uploadVideoService,
  deleteVideo as deleteVideoService,
  trackView as trackViewService,
  fetchWatchHistory as fetchWatchHistoryService,
} from '../services/videoService';

const DEFAULT_LIMIT = 20;

const useVideoStore = create((set, get) => ({
  // ─── State ────────────────────────────────────────────────────────────────
  videos: [],
  currentVideo: null,
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  page: 1,
  hasMore: true,
  watchHistory: [],

  // ─── fetchVideos ──────────────────────────────────────────────────────────
  /**
   * @param {object} params  - { page, limit, ... }
   * @param {boolean} reset  - if true, replace videos; if false, append
   */
  fetchVideos: async (params = {}, reset = false) => {
    set({ isLoading: true, error: null });
    try {
      const limit = params.limit || DEFAULT_LIMIT;
      const response = await fetchVideosService(params);
      const fetchedVideos = response.data.videos || response.data || [];

      set((state) => ({
        videos: reset ? fetchedVideos : [...state.videos, ...fetchedVideos],
        page: params.page || 1,
        hasMore: fetchedVideos.length === limit,
        isLoading: false,
      }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load videos.';
      set({ isLoading: false, error: message });
    }
  },

  // ─── fetchVideoById ───────────────────────────────────────────────────────
  fetchVideoById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchVideoByIdService(id);
      const video = response.data.video || response.data;
      set({ currentVideo: video, isLoading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load video.';
      set({ isLoading: false, error: message });
    }
  },

  // ─── uploadVideo ──────────────────────────────────────────────────────────
  uploadVideo: async (formData, onProgress) => {
    set({ isUploading: true, uploadProgress: 0, error: null });
    try {
      const response = await uploadVideoService(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          set({ uploadProgress: percent });
          if (onProgress) onProgress(percent);
        }
      });

      const newVideo = response.data.video || response.data;
      set((state) => ({
        videos: [newVideo, ...state.videos],
        isUploading: false,
        uploadProgress: 0,
      }));
      return { success: true, video: newVideo };
    } catch (err) {
      const message = err.response?.data?.message || 'Upload failed.';
      set({ isUploading: false, uploadProgress: 0, error: message });
      return { success: false, message };
    }
  },

  // ─── deleteVideo ──────────────────────────────────────────────────────────
  deleteVideo: async (id) => {
    set({ error: null });
    try {
      await deleteVideoService(id);
      set((state) => ({
        videos: state.videos.filter((v) => v.id !== id),
      }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete video.';
      set({ error: message });
    }
  },

  // ─── setCurrentVideo ──────────────────────────────────────────────────────
  setCurrentVideo: (video) => {
    set({ currentVideo: video });
  },

  // ─── trackView (fire-and-forget) ─────────────────────────────────────────
  trackView: (id, progress) => {
    trackViewService(id, progress).catch(() => {
      // Silently ignore tracking errors
    });
  },

  // ─── fetchWatchHistory ────────────────────────────────────────────────────
  fetchWatchHistory: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchWatchHistoryService(page);
      const history = response.data.videos || response.data || [];
      set({ watchHistory: history, isLoading: false });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load watch history.';
      set({ isLoading: false, error: message });
    }
  },

  // ─── clearError ───────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));

export default useVideoStore;
