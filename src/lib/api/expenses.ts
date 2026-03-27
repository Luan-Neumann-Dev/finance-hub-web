import { http } from "@/lib/http";
import type { Expense } from "@/types";

export interface CreateExpensePayload {
  amount: number,
  description: string;
  categoryId?: number;
  date?: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export async function getExpenses(): Promise<Expense[]> {
  const { data } = await http.get<Expense[]>('/expenses');
  return data;
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
  const { data } = await http.post<Expense>("/expenses", payload);
  return data;
}

export async function updateExpense(id: number, payload: UpdateExpensePayload): Promise<Expense> {
  const { data } = await http.put<Expense>(`/expenses/${id}`, payload);
  return data;
}

export async function deleteExpense(id: number): Promise<void> {
  await http.delete(`/expenses/${id}`);
}