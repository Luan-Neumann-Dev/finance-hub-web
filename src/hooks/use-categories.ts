import { useCallback, useEffect, useState } from "react";
import * as categoriesApi from "@/lib/api/categories";
import { extractErrorMessage } from "@/lib/utils";
import type { ExpenseCategory } from "@/types";

export function useCategories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await categoriesApi.getCategories();
      setCategories(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (id: number, payload: categoriesApi.CategoryPayload) => {
      const created = await categoriesApi.createCategory(payload);
      setCategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return created;
    },
    [],
  );

  const update = useCallback(
    async (id: number, payload: Partial<categoriesApi.CategoryPayload>) => {
      const updated = await categoriesApi.updateCategory(id, payload);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    },
    [],
  );

  const remove = useCallback(async (id: number) => {
    await categoriesApi.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { categories, isLoading, error, create, update, remove, reload: load };
}
