import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach Clerk session token on every request (client-side)
api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    // window.Clerk is available after ClerkProvider mounts
    const token = await (window as typeof window & { Clerk?: { session?: { getToken: () => Promise<string | null> } } }).Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
