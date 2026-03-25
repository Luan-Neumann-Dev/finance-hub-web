import { AuthResponse, User } from "@/types";
import { http } from "@/lib/http";

export async function login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>("/auth/login", {email, password});
    return data
}

export async function register(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>("/auth/register", {email, password, fullName})
    return data;
}

export async function getMe(): Promise<User> {
    const { data } = await http.get<User>("/auth/me");
    return data;
}