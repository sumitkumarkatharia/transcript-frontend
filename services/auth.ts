// services/auth.ts
import { api } from "./api";

interface LoginResponse {
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
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post("/auth/signin", { email, password });
    return response.data;
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post("/auth/signup", data);
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

  async logout() {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      await api.post("/auth/signout", { refreshToken });
    }
  },
};
