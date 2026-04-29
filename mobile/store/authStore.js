import { create } from 'zustand';
import api from '../services/api';
import { disconnectSocket } from '../services/socketService';

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,
  signOutAction: null,

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

  // Inject Clerk signOut function from layout.
  setSignOutAction: (action) => set({ signOutAction: action }),

  // ─── Logout user from Clerk + local store ───────────────────────────────────
  logout: async () => {
    const { signOutAction } = useAuthStore.getState();
    set({ isLoading: true, error: null });

    try {
      if (typeof signOutAction === 'function') {
        try {
          await signOutAction();
        } catch (clerkErr) {
          console.warn('[AuthStore] Clerk signOut error:', clerkErr);
        }
      }

      disconnectSocket();
      set({ user: null, isLoading: false, error: null });
      return { success: true };
    } catch (err) {
      console.error('[AuthStore] Logout error:', err);
      const message = err?.errors?.[0]?.message || err?.message || 'Failed to logout';
      // Even on error, we should probably clear the local user to allow retry/re-login
      set({ user: null, isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // ─── Clear user on sign-out ─────────────────────────────────────────────────
  clearUser: () => set({ user: null, error: null }),

  // ─── Clear Error ─────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),

  // ─── Loading State ───────────────────────────────────────────────────────────
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
