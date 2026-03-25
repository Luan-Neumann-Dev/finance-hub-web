import axios from "axios";

export const http = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333/api"
});

http.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("@financehub:token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config;
})

http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem("@financehub:token")
                localStorage.removeItem("@financehub:user")
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
)
