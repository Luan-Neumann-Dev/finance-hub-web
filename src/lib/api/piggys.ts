import { http } from "../http";
import type { PiggyBank, PiggyTransaction } from "@/types";

export interface PiggyBankPayload {
  name: string;
  goal?: string;
  bank: string;
}

export async function getPiggyBanks(): Promise<PiggyBank[]> {
  const { data } = await http.get<PiggyBank[]>('/piggy-banks');
  return data;
}

export async function createPiggyBank(payload: PiggyBankPayload): Promise<PiggyBank> {
  const { data } = await http.post<PiggyBank>('/piggy-banks', payload);
  return data;
}

export async function updatePiggyBank(id: number, payload: Partial<PiggyBank>): Promise<PiggyBank> {
  const { data } = await http.put<PiggyBank>(`/piggy-banks/${id}`, payload);
  return data;
}

export async function deletePiggyBank(id: number): Promise<void> {
  await http.delete(`/piggy-banks/${id}`);
}

export interface PiggyTransactionPayload {
  piggyBankId: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  description?: string;
  date?: string;
}

export async function getTransactionsByPiggy(piggyBankId: number): Promise<PiggyTransaction[]> {
  const { data } = await http.get<PiggyTransaction[]>(`/piggy-transactions/piggy-bank/${piggyBankId}`);
  return data;
}

export async function createPiggyTransaction(payload: PiggyTransactionPayload): Promise<PiggyTransaction> {
  const { data } = await http.post<PiggyTransaction>('/piggy-transactions', payload);
  return data;
}

export async function deletePiggyTransaction(id: number): Promise<void> {
  await http.delete(`/piggy-transactions/${id}`);
}
