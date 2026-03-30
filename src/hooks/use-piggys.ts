import type { PiggyBank, PiggyTransaction } from "@/types";
import { useState, useEffect, useCallback } from "react";
import * as piggysApi from "@/lib/api/piggys";
import { extractErrorMessage } from "@/lib/utils";

export function usePiggys() {
  const [piggyBanks, setPiggyBanks] = useState<PiggyBank[]>([]);
  const [transactionMap, setTransactionMap] = useState<
    Record<number, PiggyTransaction[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await piggysApi.getPiggyBanks();
      setPiggyBanks(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadTransactions = useCallback(async (piggyBankId: number) => {
    try {
      const data = await piggysApi.getTransactionsByPiggy(piggyBankId);
      setTransactionMap((prev) => ({ ...prev, [piggyBankId]: data }));
    } catch (err) {
      console.error("Erro ao carregar transações: ", extractErrorMessage(err));
    }
  }, []);

  const createPiggy = useCallback(
    async (payload: piggysApi.PiggyBankPayload) => {
      const created = await piggysApi.createPiggyBank(payload);
      setPiggyBanks((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  const updatePiggy = useCallback(
    async (id: number, payload: Partial<piggysApi.PiggyBankPayload>) => {
      const updated = await piggysApi.updatePiggyBank(id, payload);
      setPiggyBanks((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    [],
  );

  const removePiggy = useCallback(async (id: number) => {
    await piggysApi.deletePiggyBank(id);
    setPiggyBanks((prev) => prev.filter((p) => p.id !== id));
    setTransactionMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const createTransaction = useCallback(
    async (payload: piggysApi.PiggyTransactionPayload) => {
      const created = await piggysApi.createPiggyTransaction(payload);

      setPiggyBanks((prev) =>
        prev.map((p) => {
          if (p.id !== payload.piggyBankId) return p;
          const delta =
            payload.type === "deposit" ? payload.amount : -payload.amount;
          return { ...p, balance: String(Number(p.balance) + delta) };
        }),
      );

      setTransactionMap((prev) => {
        const existing = prev[payload.piggyBankId];
        if (!existing) return prev;
        return { ...prev, [payload.piggyBankId]: [created, ...existing] };
      });

      return created;
    },
    [],
  );

  const totalSavings = piggyBanks.reduce(
    (sum, p) => sum + Number(p.balance),
    0,
  );

  return {
    piggyBanks,
    isLoading,
    error,
    totalSavings,
    transactionMap,
    loadTransactions,
    createPiggy,
    updatePiggy,
    removePiggy,
    createTransaction,
    reload: load,
  };
}
