'use client'

import { formatCurrency } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { MonthlyDataPoint } from "@/types"

const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface MonthlyBarChartProps {
  data: MonthlyDataPoint[];
  year: number;
}

export function MonthlyBarChart({ data, year }: MonthlyBarChartProps) {
  const chartData = data.map((item) => ({
    month: MONTH_ABBR[item.month - 1],
    receitas: item.incomes,
    despesas: item.expenses
  }));

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h3 className="font-semibold text-foreground mb-4">Receitas vs Despesas - {year}</h3>
      <div className="h-64">
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={chartData} barCategoryGap='30%'>
            <CartesianGrid strokeDasharray='3 3' vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey='month' axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickFormatter={(v) => new Intl.NumberFormat("pt-BR", { notation: "compact", style: "currency", currency: "BRL" }).format(v)}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "10px 14px", fontSize: "13px" }}
              formatter={(v: number, n: string) => [formatCurrency(v), n === "receitas" ? "Receitas" : "Despesas"]}
            />
            <Legend formatter={(v) => <span className="text-xs text-muted-foreground capitalize">{v}</span>} />
            <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}