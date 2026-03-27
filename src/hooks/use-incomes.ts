import { Income } from "@/types";
import { useCallback, useEffect, useState } from "react";
import * as incomesApi from '@/lib/api/incomes';
import { extractErrorMessage } from "@/lib/utils";

export function useIncomes() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null);
      const data = await incomesApi.getIncomes();
      setIncomes(data);
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  useEffect(() => { load(); }, [load]);
  
  const create = useCallback(async (payload: incomesApi.CreateIncomePayload) => {
    const newIncome = await incomesApi.createIncome(payload);
    setIncomes((prev) => [...prev, newIncome]);
    return newIncome;
  }, []);
  
  const update = useCallback(async (id: number, payload: incomesApi.UpdateIncomePayload) => {
    const updated = await incomesApi.updateIncome(id, payload);
    setIncomes((prev) => prev.map((i) => (i.id === id ? updated : i)));
    return updated;
  }, []);
  
  const remove = useCallback(async (id: number) => {
    await incomesApi.deleteIncome(id);
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  }, []);
  
  const totalAmount = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  
  return { incomes, isLoading, error, totalAmount, create, update, remove, reload: load}
}