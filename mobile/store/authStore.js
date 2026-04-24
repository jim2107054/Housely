import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  // ─── Sync Clerk user with our backend DB ────────────────────────────────────
  syncWithBackend: async (extraData = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/auth/sync', extraData);
      const user = res.data.data?.user ?? res.data.user;
      set({ user, isLoading: false });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to sync user profile';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // ─── Update local user (after profile edit) ─────────────────────────────────
  setUser: (user) => set({ user }),

  // ─── Clear user on sign-out ─────────────────────────────────────────────────
  clearUser: () => set({ user: null, error: null }),

  // ─── Clear Error ─────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
