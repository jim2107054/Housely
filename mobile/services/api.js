import axios from "axios";
import { API_URL } from "../config";

// Clerk token provider — set from _layout.jsx after ClerkProvider mounts
let _getToken = null;
export const setTokenProvider = (getToken) => {
  _getToken = getToken;
};

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Attach Clerk session token to every request
api.interceptors.request.use(
  async (config) => {
    if (_getToken) {
      try {
        const token = await _getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // no active session — request proceeds without auth header
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} — ${error.response.status}`
      );
    } else if (error.request) {
      console.error("[API Error] No response received — check server/network");
    }
    return Promise.reject(error);
  }
);

export default api;
