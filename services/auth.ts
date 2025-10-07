// Fixed services/auth.ts
import { api } from "./api";

interface LoginResponse {
  message: string;
  user: any;
  accessToken: string;
  refreshToken: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

export const authService = {
  // ✅ FIXED: Correct login endpoint
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  // ✅ FIXED: Correct register endpoint
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async getProfile() {
    const response = await api.get("/users/me");
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  // ✅ FIXED: Correct logout endpoint
  async logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
  },
};
