"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import * as authApi from "@/lib/api/auth";
import type { User } from "@/types";

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    redirectTo?: string,
  ) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    redirectTo?: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | null>(null);

const TOKEN_KEY = "@financehub:token";
const USER_KEY = "@financehub:user";
const COOKIE_KEY = "@financehub:token";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));

        authApi
          .getMe()
          .then((user) => setUser(user))
          .catch(() => clearSession());
      } catch {
        clearSession();
      }
    }

    setIsLoading(false);
  }, []);

  function saveSession(token: string, userData: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    setCookie(COOKIE_KEY, token, 7);
    setUser(userData);
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    deleteCookie(COOKIE_KEY);
    setUser(null);
  }

  const login = useCallback(
    async (email: string, password: string, redirectTo = "/dashboard") => {
      const { token, user } = await authApi.login(email, password);
      saveSession(token, user);
      router.push(redirectTo);
    },
    [router],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      redirectTo = "/dashboard",
    ) => {
      const { token, user } = await authApi.register(email, password, fullName);
      saveSession(token, user);
      router.push(redirectTo);
    },
    [router],
  );

  const logout = useCallback(() => {
    clearSession();
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return context;
}
