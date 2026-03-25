"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from "@/lib/api/auth";
import type { User } from '@/types';
import Cookies from 'js-cookie';

interface AuthContextData {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, fullName: string) => Promise<void>
    logout: () => void;
}

const AuthContext = createContext<AuthContextData | null>(null);

const TOKEN_KEY = '@financehub:token';
const USER_KEY = '@financehub:user';

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

                authApi.getMe()
                    .then((user) => setUser(user))
                    .catch(() => clearSession());
            } catch {
                clearSession();
            }
        }

        setIsLoading(false);
    }, [])

    function saveSession(token: string, userDate: User) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userDate));

        Cookies.set(TOKEN_KEY, token, {
            expires: 7,
            sameSite: "Lax",
            secure: process.env.NODE_ENV === 'production',
        })

        setUser(userDate);
    }

    function clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        Cookies.remove(TOKEN_KEY);
        setUser(null);
    }

    const login = useCallback(async (email: string, password: string) => {
        const { token, user } = await authApi.login(email, password);
        saveSession(token, user);
        router.push("/dashboard");
    }, [router]);

    const register = useCallback(async (email: string, password: string, fullName: string) => {
        const { token, user } = await authApi.register(email, password, fullName);
        saveSession(token, user);
        router.push("/dashboard");
    }, [router]);

    const logout = useCallback(() => {
        clearSession();
        router.push("/login");
    }, [router])

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
    return context;
}