import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combina classes Tailwind sem conflito (ex: "p-4 p-2" → "p-2")
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formata número para moeda BRL
export function formatCurrency(value: number | string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

// Formata data ISO para exibição (ex: "2024-03-15" → "15/03/2024")
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date + "T00:00:00"));
}

// Extrai mensagem de erro de respostas Axios/NestJS
export function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
    const msg = axiosErr.response?.data?.message;
    if (Array.isArray(msg)) return msg[0];
    if (typeof msg === "string") return msg;
  }
  return "Ocorreu um erro. Tente novamente.";
}