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

// Formata data sem bug de timezone "2024-03-15" → "15/03/2024" (sem converter para UTC e perder um dia)
export function formatDateSafe(dateStr: string): string {
  const [year, month, day] = dateStr.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
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

export function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr.split("T")[0] + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}