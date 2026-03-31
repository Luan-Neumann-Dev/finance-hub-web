import type { InstallmentGroup } from "@/types";
import { useCallback, useEffect, useState } from "react";
import * as installmentsApi from "@/lib/api/installments";
import { extractErrorMessage } from "@/lib/utils";

export function useInstallments() {
  const [groups, setGroups] = useState<InstallmentGroup[]>([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await installmentsApi.getInstallmentGroups();
      setGroups(data);
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, []);

  useEffect(() => { load() }, [load]);

  const create = useCallback(async (payload: installmentsApi.CreateInstallmentPayload) => {
    const created = await installmentsApi.createInstallment(payload);
    setGroups((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateExpense = useCallback(async (
    expenseId: number,
    payload: installmentsApi.UpdateInstallmentPayload,
  ) => {
    await installmentsApi.updateInstallmentExpense(expenseId, payload);
    await load();
  }, [load])

  const deleteExpense = useCallback(async (
    expenseId: number,
    payload: installmentsApi.DeleteInstallmentPayload,
  ) => {
    await installmentsApi.deleteInstallmentExpense(expenseId, payload);

    if (payload.scope === 'this') {
      setGroups((prev) => 
        prev
          .map((g) => ({ ...g, expenses: g.expenses.filter((e) => e.id !== expenseId)}))
          .filter((g) => g.expenses.length > 0)
      )
    } else {
      await load();
    }
  }, [load])

  const totalPending = groups.reduce((sum, g) => {
    const today = new Date();

    return (
      sum +
      g.expenses
        .filter((e) => new Date(e.date) >= today)
        .reduce((s, e) => s + Number(e.amount), 0)
    );
  }, 0)

  return {groups, isLoading, error, totalPending, create, updateExpense, deleteExpense, reload: load}
}