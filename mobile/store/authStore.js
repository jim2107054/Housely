import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import api from "../services/api"; //!api calls
import { dummyAuthResponses, dummyUsers } from "../data/dummyData";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  register: async (username, email, password, role = "USER") => {
    set({ isLoading: true, error: null });
    try {
      //!api calls - uncomment when connecting backend
      // const response = await api.post("/api/auth/register", {
      //   username,
      //   email,
      //   password,
      //   role,
      // });
      // const data = response.data;

      // Local dummy data - comment out when using backend
      await new Promise((resolve) => setTimeout(resolve, 800));
      const isOwner = role === "AGENT";
      const data = isOwner
        ? { ...dummyAuthResponses.registerOwner, user: { ...dummyUsers.owner, username, email } }
        : { ...dummyAuthResponses.registerUser, user: { ...dummyUsers.user, username, email } };

      if (data.success) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("token", data.token);

        set({ user: data.user, token: data.token, isLoading: false });
        return { success: true, user: data.user, token: data.token };
      } else {
        set({ isLoading: false, error: data.message || "Registration failed" });
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }
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

  login: async (email, password, role = "USER") => {
    set({ isLoading: true, error: null });
    try {
      //!api calls - uncomment when connecting backend
      // const response = await api.post("/api/auth/login", {
      //   email,
      //   password,
      // });
      // const data = response.data;

      // Local dummy data - comment out when using backend
      await new Promise((resolve) => setTimeout(resolve, 800));
      const isOwner = role === "AGENT";
      const data = isOwner ? dummyAuthResponses.loginOwner : dummyAuthResponses.loginUser;

      if (data.success) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        await AsyncStorage.setItem("token", data.token);

        set({ user: data.user, token: data.token, isLoading: false });
        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      } else {
        set({ isLoading: false, error: data.message || "Login failed" });
        return {
          success: false,
          message: data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
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
  setUser: async (updatedUser) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.log(error);
    }
  },
}));

export default useAuthStore;
