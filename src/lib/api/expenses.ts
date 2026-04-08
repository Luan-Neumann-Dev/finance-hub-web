import { http } from "@/lib/http";
import type { Expense, PaginatedResult } from "@/types";

export interface CreateExpensePayload {
  amount: number,
  description: string;
  categoryId?: number;
  date?: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface GetExpensesParams {
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
}

export async function getExpenses(params: GetExpensesParams = {}): Promise<PaginatedResult<Expense>> {
  const { page = 1, limit = 10, month, year } = params;
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(month !== undefined ? { month: String(month) } : {}),
    ...(year !== undefined ? { year: String(year) } : {}),
  });
  const { data } = await http.get<PaginatedResult<Expense>>(`/expenses?${query}`);
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

export async function payExpense(id: number): Promise<Expense> {
  const {data} = await http.patch<Expense>(`/expenses/${id}/pay`);
  return data;
}

export async function unpayExpense(id:number): Promise<Expense> {
  const { data } = await http.patch<Expense>(`/expenses/${id}/unpay`)
  return data;
}

export async function getPendingExpenses(): Promise<Expense[]> {
  const { data } = await http.get<Expense[]>('/expenses/pending');
  return data;
}

export async function getDueSoonExpenses(days = 7): Promise<Expense[]> {
  const { data } = await http.get<Expense[]>(`/expenses/due-soon?days=${days}`)
  return data;
}