import { getAnnualReport, getMonthComparison, getMonthlyReport } from "@/lib/api/reports";
import { extractErrorMessage } from "@/lib/utils";
import type { AnnualReport, MonthComparison, MonthlyReport } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface DashboardData {
    monthly: MonthlyReport | null;
    annual: AnnualReport | null;
    comparison: MonthComparison | null;
}

export function useDashboard(year: number) {
    const [data, setData] = useState<DashboardData>({ monthly: null, annual: null, comparison: null })
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [monthly, annual, comparison] = await Promise.all([
                getMonthlyReport(),
                getAnnualReport(year),
                getMonthComparison()
            ])
            setData({ monthly, annual, comparison })
        } catch (err) {
            setError(extractErrorMessage(err))
        } finally {
            setIsLoading(false)
        }
    }, [year]);
    
    useEffect(() => {load(); }, [load]);

    return { ...data, isLoading, error, reload: load }
}