import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

// Combina classes Tailwind sem conflito (ex: "p-4 p-2" → "p-2")
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Formata número para moeda BRL
export function formatCurrency(value: number | string): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: 'BRL',
    }).format(Number(value));
}

