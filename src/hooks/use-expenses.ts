import { useCallback, useEffect, useState } from "react";
import { extractErrorMessage } from "@/lib/utils";
import * as expensesApi from "@/lib/api/expenses";
import { PaginationMeta, type Expense } from "@/types";

const DEFAULT_LIMIT = 10;

function getCurrentMonthYear() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear().month);
  const [currentYear, setCurrentYear] = useState(getCurrentMonthYear().year);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (page: number, month: number, year: number) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await expensesApi.getExpenses({
          page,
          limit: DEFAULT_LIMIT,
          month,
          year,
        });
        setExpenses(result.data);
        setMeta(result.meta);
        setCurrentPage(page);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    load(1, currentMonth, currentYear);
  }, [load, currentMonth, currentYear]);

  const goToPage = useCallback(
    (page: number) => {
      load(page, currentMonth, currentYear);
    },
    [load, currentMonth, currentYear],
  );

  const goToMonth = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  const create = useCallback(
    async (payload: expensesApi.CreateExpensePayload) => {
      const created = await expensesApi.createExpense(payload);
      await load(1, currentMonth, currentYear);
      return created;
    },
    [load, currentMonth, currentYear],
  );

  const update = useCallback(
    async (id: number, payload: expensesApi.UpdateExpensePayload) => {
      const updated = await expensesApi.updateExpense(id, payload);
      await load(currentPage, currentMonth, currentYear);
      return updated;
    },
    [currentPage, currentMonth, currentYear, load],
  );

  const remove = useCallback(
    async (id: number) => {
      await expensesApi.deleteExpense(id);
      const targetPage =
        expenses.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;
      await load(targetPage, currentMonth, currentYear);
    },
    [expenses.length, currentPage, currentMonth, currentYear, load],
  );

  const pay = useCallback(
    async (id: number) => {
      const updated = await expensesApi.payExpense(id);
      await load(currentPage, currentMonth, currentYear);
      return updated;
    },
    [currentPage, currentMonth, currentYear, load],
  );

  const unpay = useCallback(
    async (id: number) => {
      const updated = await expensesApi.unpayExpense(id);
      await load(currentPage, currentMonth, currentYear);
      return updated;
    },
    [currentPage, currentMonth, currentYear, load],
  );

  const totalPaid = meta?.totalPaid ?? 0;
  const totalPending = meta?.totalPending ?? 0;

  return {
    expenses,
    isLoading,
    error,
    meta,
    currentPage,
    currentMonth,
    currentYear,
    goToPage,
    goToMonth,
    totalPaid,
    totalPendingExpenses: totalPending,
    create,
    update,
    remove,
    pay,
    unpay,
    reload: () => load(currentPage, currentMonth, currentYear),
  };
}
