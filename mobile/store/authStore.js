import { create } from "zustand";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,

  register: async (fullname, email, password) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          fullname,
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      if (data.success) {
        set({ user: data.user, token: data.token, isLoading: false });
      } else {
        set({ isLoading: false, error: data.message || "Registration failed" });
        throw new Error(data.message || "Registration failed");
      }

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({ token: data.token, user: data.user, isLoading: false });
      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Registration failed";
      set({ isLoading: false, error: errorMessage });
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
  login: async (email, password) => {
    try {
      set({ isLoading: true });
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      if (data.success) {
        set({ user: data.user, token: data.token, isLoading: false });
      } else {
        set({ isLoading: false, error: data.message || "Login failed" });
        throw new Error(data.message || "Login failed");
      }
      // Store token and user in AsyncStorage
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      // Update state
      set({ token: data.token, user: data.user, isLoading: false });
      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed";
      set({ isLoading: false, error: errorMessage });
      return {
        success: false,
        message: errorMessage,
      };
    }
  },
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userJson = await AsyncStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;

      if (token && user) {
        set({ token, user });
      }
    } catch (error) {
      console.log(error);
    }
  },
  logout: async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      set({ user: null, token: null });
    } catch (error) {
      console.log(error);
    }
  },
}));

export default useAuthStore;
