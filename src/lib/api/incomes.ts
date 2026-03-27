import { http } from "@/lib/http";
import type { Income } from "@/types";

export interface CreateIncomePayload {
  name: string;
  amount: number;
  recurrence: 'none' | 'monthly' | 'weekly' | 'annual';
  receiveDate?: number;
}

export type UpdateIncomePayload = Partial<CreateIncomePayload>

export async function getIncomes(): Promise<Income[]> {
  const { data } = await http.get<Income[]>('/incomes');
  return data;
}

export async function createIncome(payload: CreateIncomePayload): Promise<Income> {
  const { data } = await http.post<Income>("/incomes", payload);
  return data;
}

export async function updateIncome(id: number, payload: UpdateIncomePayload): Promise<Income> {
  const { data } = await http.put<Income>(`/incomes/${id}`, payload);
  return data;
}

export async function deleteIncome(id: number): Promise<void> {
  await http.delete(`/incomes/${id}`);
}