import { http } from "@/lib/http";
import type { ExpenseCategory } from "@/types";

export interface CategoryPayload {
  name: string;
  color: string;
  icon?: string;
}

export async function getCategories(): Promise<ExpenseCategory[]> {
  const { data } = await http.get<ExpenseCategory[]>("/categories");
  return data;
}

export async function createCategory(payload: CategoryPayload): Promise<ExpenseCategory> {
  const { data } = await http.post<ExpenseCategory>("/categories", payload);
  return data;
}

export async function updateCategory(id: number, payload: Partial<CategoryPayload>): Promise<ExpenseCategory> {
  const { data } = await http.put<ExpenseCategory>(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  await http.delete(`/categories/${id}`);
}