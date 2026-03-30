import {http} from '@/lib/http';
import type { MonthlyReport, AnnualReport, MonthComparison } from '@/types';

export async function getMonthlyReport(): Promise<MonthlyReport> {
    const {data} = await http.get<MonthlyReport>("/reports/monthly");
    return data;
}

export async function getAnnualReport(year:number): Promise<AnnualReport> {
    const {data} = await http.get<AnnualReport>(`/reports/annual?year=${year}`)
    return data;
}

export async function getMonthComparison(): Promise<MonthComparison> {
    const {data} = await http.get<MonthComparison>('/reports/month-comparison');
    return data;
}

export async function getPeriodReport(startDate: string, endDate: string) {
    const {data} = await http.get(`/reports/period?startDate=${startDate}&endDate=${endDate}`);
    return data;
}