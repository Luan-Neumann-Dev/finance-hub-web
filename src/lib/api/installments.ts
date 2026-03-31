import type { InstallmentGroup } from "@/types";
import { http } from "@/lib/http";

export interface CreateInstallmentPayload {
  description: string;
  totalAmount: number;
  installments: number;
  categoryId?: number;
  firstInstallmentDate: string;
}

export type UpdateScope = "this" | 'future';
export type DeleteScope = 'this' | 'future';

export interface UpdateInstallmentPayload {
  scope: UpdateScope;
  description?: string;
  amount?: number;
  categoryId?: number;
}

export interface DeleteInstallmentPayload {
  scope: DeleteScope
}

export async function getInstallmentGroups(): Promise<InstallmentGroup[]> {
  const {data} = await http.get<InstallmentGroup[]>('/installments')
  return data;
}

export async function createInstallment(
  payload: CreateInstallmentPayload
): Promise<InstallmentGroup> {
  const { data } = await http.post<InstallmentGroup>('/installments', payload);
  return data;
}

export async function updateInstallmentExpense(
  expenseId: number,
  payload: UpdateInstallmentPayload,
): Promise<void> {
  await http.put(`/installments/expense/${expenseId}`, payload)
}

export async function deleteInstallmentExpense(
  expenseId: number,
  payload: DeleteInstallmentPayload,
): Promise<void> {
  await http.delete(`/installments/expense/${expenseId}`, { data: payload});
}