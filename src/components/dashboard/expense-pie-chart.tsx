'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyReport } from "@/types";

interface ExpensePieChartProps {
  data: MonthlyReport['expensesByCategory']
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: item.total,
    color: item.categoryColor,
  }));

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      <h3 className="font-semibold text-foreground mb-4">Gastos por Categoria</h3>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p className="text-center text-sm">
            Nenhum gasto registrado este mês <br />
            Adicione despesas para ver o gráfico
          </p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                cx='50%' cy='50%'
                innerRadius={55} outerRadius={85}
                paddingAngle={3} dataKey='value'
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Total']}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 14px', fontSize: '13px' }}
              />
              <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}