'use client'

import { getDueSoonExpenses, payExpense } from "@/lib/api/expenses";
import { formatCurrency, getDaysUntil, cn, formatDateSafe } from "@/lib/utils";
import type { Expense } from "@/types";
import { AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

interface PendingExpensesWidgetProps {
  totalPending: number;
}

export function PendingExpensesWidget({ totalPending }: PendingExpensesWidgetProps) {
  const [dueSoon, setDueSoon]   = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paying, setPaying]     = useState<number | null>(null);

  useEffect(() => {
    getDueSoonExpenses(7)
      .then(setDueSoon)
      .finally(() => setIsLoading(false));
  }, []);

  async function handlePay(id: number) {
    setPaying(id);
    try {
      await payExpense(id);
      setDueSoon((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setPaying(null);
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Contas Pendentes</h3>
          </div>
          <p className="text-2xl font-bold text-destructive mt-1">
            {formatCurrency(totalPending)}
          </p>
          <p className="text-xs text-muted-foreground">total a pagar este mês</p>
        </div>
      </div>

      {/* Lista próximas a vencer */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Vencem nos próximos 7 dias
        </p>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map((n) => (
              <div key={n} className="h-12 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : dueSoon.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-success bg-success/5 border border-success/20 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Nenhuma conta vencendo nos próximos 7 dias!
          </div>
        ) : (
          <div className="space-y-2">
            {dueSoon.map((expense) => {
              const daysUntil = getDaysUntil(expense.date);
              const isOverdue = daysUntil < 0;
              const isToday   = daysUntil === 0;

              return (
                <div
                  key={expense.id}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl border",
                    isOverdue ? "bg-destructive/5 border-destructive/20"
                    : isToday  ? "bg-warning/5 border-warning/20"
                    :            "bg-muted/50 border-border"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {expense.category && (
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: expense.category.color }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {expense.description}
                      </p>
                      <span className={cn(
                        "text-xs flex items-center gap-1",
                        isOverdue ? "text-destructive font-medium"
                        : isToday  ? "text-orange-500 font-medium"
                        :            "text-muted-foreground"
                      )}>
                        <Calendar className="w-3 h-3" />
                        {isOverdue
                          ? `Venceu há ${Math.abs(daysUntil)} dia(s)`
                          : isToday
                          ? "Vence hoje"
                          : `Vence em ${daysUntil} dia(s) — ${formatDateSafe(expense.date)}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-sm font-semibold text-destructive">
                      {formatCurrency(expense.amount)}
                    </span>
                    <button
                      onClick={() => handlePay(expense.id)}
                      disabled={paying === expense.id}
                      title="Marcar como paga"
                      className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                    >
                      {paying === expense.id
                        ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        : <CheckCircle2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}