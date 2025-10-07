// Updated contexts/AuthContext.tsx - Store tokens in cookies
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cookie helper functions
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

const getCookie = (name: string): string | null => {
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

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie("accessToken");
    if (token) {
      authService
        .getProfile()
        .then(setUser)
        .catch(() => {
          deleteCookie("accessToken");
          deleteCookie("refreshToken");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      console.log("Login response:", response);

      const { user, accessToken, refreshToken } = response;

      if (accessToken && refreshToken) {
        // Store in cookies (middleware can access these)
        setCookie("accessToken", accessToken, 7); // 7 days
        setCookie("refreshToken", refreshToken, 30); // 30 days

        setUser(user);
        toast.success("Login successful!");
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error?.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      console.log("Register response:", response);

      const { user, accessToken, refreshToken } = response;

      if (accessToken && refreshToken) {
        // Store in cookies (middleware can access these)
        setCookie("accessToken", accessToken, 7); // 7 days
        setCookie("refreshToken", refreshToken, 30); // 30 days

        setUser(user);
        toast.success("Registration successful!");
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Register error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Registration failed";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      deleteCookie("accessToken");
      deleteCookie("refreshToken");
      setUser(null);
      router.push("/auth/login");
      toast.success("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
