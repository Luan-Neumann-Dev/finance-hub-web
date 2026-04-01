'use client'

import { Wallet, TrendingDown, TrendingUp, PiggyBank } from "lucide-react"
import { useDashboard } from "@/hooks/use-dashboard"
import { useAuth } from "@/providers/auth-provider"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart"
import { MonthlyBarChart } from "@/components/dashboard/monthly-bar-chart"
import { InsightCard } from "@/components/dashboard/insight-card"
import { formatCurrency } from "@/lib/utils"
import type { MonthlyReport, MonthComparison } from "@/types"
import { PendingExpensesWidget } from "@/components/dashboard/pending-expenses-widget";

const CURRENT_YEAR = new Date().getFullYear();
const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function buildInsights(monthly: MonthlyReport, comparison: MonthComparison) {
  const insights: { text: string; type: 'positive' | 'negative' | 'neutral' | 'info' }[] = [];

  if (monthly.totalIncomes > 0 && monthly.totalExpenses > 0) {
    const pct = ((monthly.totalExpenses / monthly.totalIncomes) * 100).toFixed(1);
    const type = parseFloat(pct) > 100 ? 'negative' : parseFloat(pct) < 70 ? 'positive' : 'neutral';
    insights.push({ text: `Você gastou ${pct}% da sua renda este mês.`, type });
  }

  if (monthly.totalExpenses > monthly.totalIncomes && monthly.totalIncomes > 0) {
    insights.push({ text: "Atenção: seus gastos estão acima da sua renda mensal.", type: "negative" });
  } else if (monthly.totalExpenses < monthly.totalIncomes * 0.7 && monthly.totalIncomes > 0) {
    insights.push({ text: "Parabéns! Você está economizando mais de 30% da renda.", type: "positive" });
  }

  if (monthly.expensesByCategory.length > 0) {
    const top = monthly.expensesByCategory[0];
    insights.push({ text: `"${top.categoryName}" é sua maior categoria (${top.percentage.toFixed(1)}% das despesas)`, type: 'info' })
  }

  if (comparison.previousMonth.total > 0) {
    const pct = Math.abs(comparison.percentageChange).toFixed(1);
    if (comparison.trend === 'increase') {
      insights.push({ text: `Seus gastos aumentaram ${pct}% em relação ao mês anterior.`, type: 'negative' });
    } else if (comparison.trend === 'decrease') {
      insights.push({ text: `Seus gastos caíram ${pct}% em relação ao mês anterior. Ótimo!`, type: "positive" });
    }
  }

  if (monthly.totalSavings > 0) {
    insights.push({ text: `Você tem ${formatCurrency(monthly.totalSavings)} guardados nos seus cofrinhos.`, type: 'info' })
  }

  return insights.slice(0, 4);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { monthly, annual, comparison, isLoading, error } = useDashboard(CURRENT_YEAR);

  const now = new Date();
  const firstName = user?.fullName?.split(' ')[0] ?? 'Você';
  const currentMonthName = MONTH_NAMES[now.getMonth()];

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Olá, {firstName} 👋</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral das suas finanças - {currentMonthName} de {now.getFullYear()}
        </p>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
          Erro ao carregar dados: {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-7 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
                <div className="w-11 h-11 rounded-xl bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : monthly && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
          <SummaryCard title="Receitas" value={monthly.totalIncomes} icon={Wallet} variant="income" subtitle="Total do mês" />
          <SummaryCard title="Despesas" value={monthly.totalExpenses} icon={TrendingDown} variant="expense" subtitle="Total de mês" />
          <SummaryCard title="Saldo" value={monthly.balance} icon={TrendingUp} variant={monthly.balance >= 0 ? 'income' : 'expense'} subtitle="Receitas - Despesas" />
          <SummaryCard title="Cofrinhos" value={monthly.totalSavings} icon={PiggyBank} variant="savings" subtitle="Total guardado" />
        </div>
      )}

      {!isLoading && monthly && annual && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up">
            <ExpensePieChart data={monthly.expensesByCategory} />
            <InsightCard insights={comparison ? buildInsights(monthly, comparison) : []} />
          </div>
          <div className="animate-fade-up">
            <PendingExpensesWidget totalPending={monthly.totalPending} />
          </div>

          <div className="animate-fade-up">
            <MonthlyBarChart data={annual.monthlyData} year={CURRENT_YEAR} />
          </div>
        </>
      )}

      {isLoading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((n) => (
              <div key={n} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                <div className="h-64 bg-muted rounded-xl" />
              </div>
            ))}
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </>
      )}
    </div>
  )
}