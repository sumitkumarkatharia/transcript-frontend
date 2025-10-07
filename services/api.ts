// Updated services/api.ts - Read tokens from cookies
import axios from "axios";
import toast from "react-hot-toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to get cookie value
const getCookieValue = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Request interceptor to add auth token from cookies
api.interceptors.request.use((config) => {
  const token = getCookieValue("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getCookieValue("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          // Update cookie
          const expires = new Date();
          expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
          document.cookie = `accessToken=${accessToken};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Clear cookies
        document.cookie =
          "accessToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
        document.cookie =
          "refreshToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    const message =
      error.response?.data?.message || error.message || "An error occurred";
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);
