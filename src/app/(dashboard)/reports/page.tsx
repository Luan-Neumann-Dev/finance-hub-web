'use client'

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboard } from "@/hooks/use-dashboard";
import { cn, formatCurrency } from "@/lib/utils";
import type { MonthComparison, MonthlyReport } from "@/types";
import { ArrowDown, ArrowRight, ArrowUp, BarChart3, Minus, PieChartIcon, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";


const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const YEARS = [2024, 2025, 2026, 2027]

const TOOLTIP_STYLE = {
  backgroundColor: 'white', border: '1px solid #e5e7eb',
  borderRadius: '12px', padding: '10px 14px', fontSize: '13px'
};

function buildInsights(monthly: MonthlyReport, comparison: MonthComparison, monthName: string) {
  const list: { text: string; type: "positive" | "negative" | "neutral" | "info" }[] = [];

  if (monthly.totalIncomes > 0 && monthly.totalExpenses > 0) {
    const pct = ((monthly.totalExpenses / monthly.totalIncomes) * 100).toFixed(1);
    const type = parseFloat(pct) > 100 ? "negative" : parseFloat(pct) < 70 ? "positive" : "neutral";
    list.push({ text: `Você gastou ${pct}% da sua renda em ${monthName}.`, type });
  }
  if (monthly.totalExpenses > monthly.totalIncomes && monthly.totalIncomes > 0) {
    list.push({ text: "Atenção: seus gastos estão acima da sua renda mensal.", type: "negative" });
  } else if (monthly.totalExpenses < monthly.totalIncomes * 0.7 && monthly.totalIncomes > 0) {
    list.push({ text: "Parabéns! Você está economizando mais de 30% da renda.", type: "positive" });
  }
  if (monthly.expensesByCategory.length > 0) {
    const top = monthly.expensesByCategory[0];
    list.push({ text: `"${top.categoryName}" representa ${top.percentage.toFixed(1)}% dos seus gastos.`, type: "info" });
  }
  if (comparison.previousMonth.total > 0) {
    const pct = Math.abs(comparison.percentageChange).toFixed(1);
    if (comparison.trend === "increase") {
      list.push({ text: `Gastos ${pct}% maiores que o mês anterior.`, type: "negative" });
    } else if (comparison.trend === "decrease") {
      list.push({ text: `Gastos ${pct}% menores que o mês anterior. Ótimo!`, type: "positive" });
    }
  }
  return list;
}

const insightBg = {
  positive: "bg-success/5 border-success/20",
  negative: "bg-destructive/5 border-destructive/20",
  neutral: "bg-primary/5 border-primary/20",
  info: "bg-muted/50 border-border",
};

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { monthly, annual, comparison, isLoading } = useDashboard(selectedYear);

  const currentMonthIdx = new Date().getMonth();
  const currentMonthName = MONTH_NAMES[currentMonthIdx];
  const annualBalance = (annual?.totalIncomes ?? 0) - (annual?.totalExpenses ?? 0);

  const barData = (annual?.monthlyData ?? []).map((m) => ({ month: MONTH_ABBR[m.month - 1], receitas: m.incomes, despesas: m.expenses }));
  const lineData = (annual?.monthlyData ?? []).map((m) => ({ month: MONTH_ABBR[m.month - 1], saldo: m.balance }));
  const pieData = (monthly?.expensesByCategory ?? []).map((m) => ({ name: m.categoryName, value: m.total, color: m.categoryColor, pct: m.percentage }));

  const trendIcon = comparison?.trend === 'increase'
    ? <ArrowUp className="w-4 h-4 text-destructive" />
    : comparison?.trend === 'decrease'
      ? <ArrowDown className="w-4 h-4 text-success" />
      : <Minus className="w-4 h-4 text-muted-foreground" />

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground mt-1">Análise completa das suas finanças</p>
        </div>
        <div className="flex gap-2">
          {YEARS.map((year) => (
            <Button key={year} variant={selectedYear === year ? 'default' : 'outline'} size="sm" onClick={() => setSelectedYear(year)}>
              {year}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
              <div className="h-3 bg-muted rounded w-1/2 mb-3" />
              <div className="h-7 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
          <div className="bg-card rounded-2xl border border-success/20 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" /><span className="text-sm text-muted-foreground">Receita Anual</span>
            </div>
            <p className="text-2xl font-bold text-success">{formatCurrency(annual?.totalIncomes ?? 0)}</p>
          </div>

          <div className="bg-card rounded-2xl border border-destructive/20 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-destructive" /><span className="text-sm text-muted-foreground">Despesas Anuais</span></div>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(annual?.totalExpenses ?? 0)}</p>
          </div>
          <div className="bg-card rounded-2xl border border-primary/20 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-primary" /><span className="text-sm text-muted-foreground">Saldo Anual</span></div>
            <p className={cn("text-2xl font-bold", annualBalance >= 0 ? "text-success" : "text-destructive")}>{formatCurrency(annualBalance)}</p>
          </div>
        </div>
      )}

      {!isLoading && comparison && (
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm animate-fade-up">
          <p className="text-sm text-muted-foreground mb-1">Comparativo com mês anterior</p>
          <div className="flex items-center gap-2">
            {trendIcon}
            <span className="font-semibold">{formatCurrency(Math.abs(comparison.difference))}</span>
            <span className="text-sm text-muted-foreground">
              ({Math.abs(comparison.percentageChange).toFixed(1)}%{" "}
              {comparison.trend === "increase" ? "a mais" : comparison.trend === "decrease" ? "a menos" : "igual"})
              {" "}em relação ao mês anterior
            </span>
          </div>
        </div>
      )}

      <div className="animate-fade-up">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Receitas vs Despesas - {selectedYear}</h3>
              <div className="h-72">
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={barData} barCategoryGap='30%'>
                    <CartesianGrid strokeDasharray='3 3' vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey='month' axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickFormatter={(v) => new Intl.NumberFormat('pt-BR', { notation: 'compact', style: 'currency', currency: 'BRL' }).format(v)}
                    />

                    <Tooltip contentStyle={TOOLTIP_STYLE}
                      formatter={(v: number, n: string) => [formatCurrency(v), n === 'receitas' ? 'Receitas' : 'Despesas']}
                    />
                    <Legend formatter={(v) => <span className="text-xs text-muted-foreground capitalize">{v}</span>} />
                    <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Evolução do Saldo - {selectedYear}</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }}
                      tickFormatter={(v) => new Intl.NumberFormat("pt-BR", { notation: "compact", style: "currency", currency: "BRL" }).format(v)} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [formatCurrency(v), "Saldo"]} />
                    <Line type="monotone" dataKey="saldo" stroke="#f97316" strokeWidth={2.5}
                      dot={{ fill: "#f97316", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Distribuição — {currentMonthName}</h3>
                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center h-56 text-muted-foreground text-sm">Nenhum gasto registrado este mês.</div>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [formatCurrency(v), "Total"]} />
                        <Legend formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Ranking — {currentMonthName}</h3>
                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center h-56 text-muted-foreground text-sm">Nenhum gasto registrado este mês.</div>
                ) : (
                  <div className="space-y-4">
                    {pieData.slice(0, 5).map((cat, i) => (
                      <div key={cat.name} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">{i + 1}</span>
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium truncate">{cat.name}</span>
                            <span className="text-xs text-muted-foreground ml-2 shrink-0">{cat.pct.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(cat.pct, 100)}%`, backgroundColor: cat.color }} />
                          </div>
                        </div>
                        <span className="text-sm font-semibold shrink-0">{formatCurrency(cat.value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <PieChartIcon className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Insights — {currentMonthName}</h3>
              </div>
              {!monthly || !comparison ? (
                <p className="text-center text-muted-foreground py-10 text-sm">Carregando insights...</p>
              ) : (() => {
                const insights = buildInsights(monthly, comparison, currentMonthName);
                return insights.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10 text-sm">Adicione receitas e despesas para gerar insights.</p>
                ) : (
                  <div className="space-y-3">
                    {insights.map((insight, i) => (
                      <div key={i} className={cn("flex items-start gap-3 p-4 rounded-xl border", insightBg[insight.type])}>
                        <ArrowRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground">{insight.text}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}