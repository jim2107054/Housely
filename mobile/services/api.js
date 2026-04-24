import axios from "axios";
import { API_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

console.log('[API Service] Initializing with base URL:', API_URL);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Track if we're currently refreshing to avoid multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

// Callback to clear Zustand auth state without a circular import
let _onAuthFailure = null;
export const setAuthFailureCallback = (cb) => { _onAuthFailure = cb; };

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Comprehensive error logging
    console.error('\n========== API ERROR ==========');
    console.error('[Base URL]', API_URL);
    
    if (error.response) {
      // Server responded with error status
      console.error('[Status]', error.response.status);
      console.error('[Response Data]', JSON.stringify(error.response.data, null, 2));
      console.error('[Request URL]', error.config?.url);
      console.error('[Request Method]', error.config?.method?.toUpperCase());
      
      // Handle 401 Unauthorized - Try to refresh token
      if (error.response.status === 401 && !originalRequest._retry) {
        // Don't retry refresh token endpoint itself
        if (originalRequest.url?.includes('/auth/refresh-token')) {
          console.error('[Auth] Refresh token is invalid, logging out');
          await AsyncStorage.multiRemove(["token", "refreshToken", "user"]);
          console.error('==============================\n');
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return api(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await AsyncStorage.getItem("refreshToken");
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          console.log('[Auth] Access token expired, refreshing...');
          
          // Call refresh token endpoint
          const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          await AsyncStorage.setItem("token", accessToken);
          if (newRefreshToken) {
            await AsyncStorage.setItem("refreshToken", newRefreshToken);
          }

          console.log('[Auth] Token refreshed successfully');

          // Update the original request with new token
          originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
          
          // Process queued requests
          processQueue(null, accessToken);
          
          isRefreshing = false;
          
          // Retry original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error('[Auth] Token refresh failed, logging out');
          processQueue(refreshError, null);
          isRefreshing = false;
          
          // Clear all auth data
          await AsyncStorage.multiRemove(["token", "refreshToken", "user"]);

          // Notify the app to reset auth state and redirect to login
          if (_onAuthFailure) _onAuthFailure();

          return Promise.reject(refreshError);
        }
      }
    } else if (error.request) {
      // Request made but no response received - NETWORK ERROR
      console.error('[Network Error] No response received from server');
      console.error('[Request URL]', error.config?.baseURL + error.config?.url);
      console.error('[Request Method]', error.config?.method?.toUpperCase());
      console.error('[Possible Causes]:');
      console.error('  1. Backend server is not running');
      console.error('  2. Wrong IP address in config.js');
      console.error('  3. Device/emulator cannot reach the server');
      console.error('  4. Firewall blocking the connection');
      console.error('  5. Android cleartext traffic not allowed (HTTP)');
      console.error('[Request Object]', JSON.stringify({
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
      }, null, 2));
    } else {
      // Request setup error
      console.error('[Request Setup Error]', error.message);
    }
    
    console.error('==============================\n');
    
    return Promise.reject(error);
  }
);

export default api;
