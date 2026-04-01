import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage } from "@/lib/utils";
import * as expensesApi from '@/lib/api/expenses'
import { PaginationMeta, type Expense } from "@/types";

const DEFAULT_LIMIT = 10;

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await expensesApi.getExpenses({page, limit: DEFAULT_LIMIT});
      setExpenses(result.data);
      setMeta(result.meta);
      setCurrentPage(page);
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, []);

  useEffect(() => { load(1); }, [load])
  
  const goToPage = useCallback((page: number) => {
    load(page);
  }, [load]);

  const create = useCallback(async (payload: expensesApi.CreateExpensePayload) => {
    const created = await expensesApi.createExpense(payload);
    await load(1);
    return created;
  }, [load]);

  const update = useCallback(async (id: number, payload: expensesApi.UpdateExpensePayload) => {
    const updated = await expensesApi.updateExpense(id, payload);
    setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
    return updated;
  }, [])

  const remove = useCallback(async (id: number) => {
    await expensesApi.deleteExpense(id);
    const targetPage = expenses.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
    await load(targetPage);
  }, [expenses.length, currentPage, load])

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

  const totalPaid = expenses.filter((e) => e.paidAt).reduce((s, e) => s + Number(e.amount), 0);
  const totalPending = expenses.filter((e) => !e.paidAt).reduce((s, e) => s + Number(e.amount), 0);

  return { expenses, isLoading, error, meta, currentPage, goToPage, totalPaid, totalPendingExpenses: totalPending, create, update, remove, pay, unpay, reload: () => load(currentPage) };
}