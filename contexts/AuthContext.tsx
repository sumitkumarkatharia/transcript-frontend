// contexts/AuthContext.tsx
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Verify token and get user info
      authService
        .getProfile()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user, accessToken, refreshToken } = await authService.login(
        email,
        password
      );
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const { user, accessToken, refreshToken } = await authService.register(
        data
      );
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user);
      toast.success("Registration successful!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    router.push("/auth/login");
    toast.success("Logged out successfully");
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
