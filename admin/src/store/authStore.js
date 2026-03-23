import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('adminUser') || 'null'),
  token: localStorage.getItem('adminToken') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/api/auth/login', { email, password });
      // Backend login response: { success, token, accessToken, user, ... }
      const { accessToken, token, user } = res.data;
      const finalToken = accessToken || token;
      if (user.role !== 'ADMIN') throw new Error('Access denied. Admin accounts only.');
      localStorage.setItem('adminToken', finalToken);
      localStorage.setItem('adminUser', JSON.stringify(user));
      set({ user, token: finalToken, isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    set({ user: null, token: null });
  },
}));
