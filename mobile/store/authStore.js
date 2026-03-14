import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // ─── Register ───────────────────────────────────────────────────────────────
  register: async (username, email, password, role = 'USER') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/auth/register', {
        username,
        email,
        password,
        role,
      });

      const { user, token, accessToken, refreshToken } = response.data;
      const authToken = token || accessToken;

      await AsyncStorage.setItem('token', authToken);
      if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({ user, token: authToken, isLoading: false, error: null });
      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // ─── Login ──────────────────────────────────────────────────────────────────
  login: async (email, password, role = 'USER') => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
        role,
      });

      const { user, token, accessToken, refreshToken } = response.data;
      const authToken = token || accessToken;

      await AsyncStorage.setItem('token', authToken);
      if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({ user, token: authToken, isLoading: false, error: null });
      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // ─── Logout ─────────────────────────────────────────────────────────────────
  logout: async () => {
    set({ isLoading: true });
    try {
      // Notify backend (best effort – don't block logout if it fails)
      await api.post('/api/auth/logout').catch(() => {});
    } finally {
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
      set({ user: null, token: null, isLoading: false, error: null });
    }
  },

  // ─── Check Auth (app startup) ───────────────────────────────────────────────
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);

      if (!storedToken || !storedUser) {
        set({ user: null, token: null, isLoading: false });
        return false;
      }

      // Restore from storage immediately for fast startup
      const parsedUser = JSON.parse(storedUser);
      set({ user: parsedUser, token: storedToken });

      // Verify token is still valid by hitting /api/users/me
      try {
        const res = await api.get('/api/users/me');
        const freshUser = res.data.user || res.data;
        await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        set({ user: freshUser, isLoading: false });
      } catch {
        // Token invalid — clear auth state
        await AsyncStorage.multiRemove(['token', 'refreshToken', 'user']);
        set({ user: null, token: null, isLoading: false });
        return false;
      }

      return true;
    } catch {
      set({ user: null, token: null, isLoading: false });
      return false;
    }
  },

  // ─── Update User (after profile edit) ───────────────────────────────────────
  setUser: (user) => {
    AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  // ─── Clear Error ─────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
