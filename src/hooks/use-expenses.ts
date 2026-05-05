import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage } from "@/lib/utils";
import * as expensesApi from '@/lib/api/expenses'
import type { Expense } from "@/types";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expensesApi.getExpenses();
      setExpenses([...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, []);

  useEffect(() => { load() }, [load])

  const create = useCallback(async (payload: expensesApi.CreateExpensePayload) => {
    const created = await expensesApi.createExpense(payload);
    setExpenses((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: number, payload: expensesApi.UpdateExpensePayload) => {
    const updated = await expensesApi.updateExpense(id, payload);
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
    return updated;
  }, [])

  const remove = useCallback(async (id: number) => {
    await expensesApi.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, [])

  const pay = useCallback(async (id: number) => {
    const updated = await expensesApi.payExpense(id);
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  }, []);

  const unpay = useCallback(async (id: number) => {
    const updated = await expensesApi.unpayExpense(id);
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  }, []);

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPaid = expenses.filter((e) => e.paidAt).reduce((s, e) => s + Number(e.amount), 0);
  const totalPending = expenses.filter((e) => !e.paidAt).reduce((s, e) => s + Number(e.amount), 0);

  return { expenses, isLoading, error, totalAmount, totalPaid, totalPendingExpenses: totalPending, create, update, remove, pay, unpay, reload: load };
}