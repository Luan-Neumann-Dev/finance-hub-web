"use client";

import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Wallet,
  Calendar,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useIncomes } from "@/hooks/use-incomes";
import type { Income } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatCurrency, extractErrorMessage } from "@/lib/utils";

const EMPTY_FORM = {
  name: "",
  amount: "",
  recurrence: "monthly" as const,
  receiveDate: "5",
};

const RECURRENCE_OPTIONS = [
  { value: "none", label: "Não recorrente" },
  { value: "monthly", label: "Mensal" },
  { value: "weekly", label: "Semanal" },
  { value: "annual", label: "Anual" },
] as const;

const RECURRENCE_LABELS: Record<string, string> = {
  none: "Não recorrente",
  monthly: "Mensal",
  weekly: "Semanal",
  annual: "Anual",
};

export default function IncomesPage() {
  const { incomes, isLoading, error, totalAmount, create, update, remove } =
    useIncomes();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function openCreate() {
    setEditingIncome(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setIsDialogOpen(true);
  }

  function openEdit(income: Income) {
    setEditingIncome(income);
    setFormData({
      name: income.name,
      amount: String(income.amount),
      recurrence: income.recurrence as (typeof EMPTY_FORM)["recurrence"],
      receiveDate: String(income.receiveDate),
    });
    setFormError(null);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);

    setTimeout(() => {
      setEditingIncome(null);
      setFormData(EMPTY_FORM);
      setFormError(null);
    }, 200);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        recurrence: formData.recurrence,
        receiveDate: parseInt(formData.receiveDate, 10),
      };

      if (editingIncome) {
        await update(editingIncome.id, payload);
      } else {
        await create(payload);
      }
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir esta receita?")) return;

    try {
      await remove(id);
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Receitas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas fontes de renda
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => !open && closeDialog()}
        >
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" />
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIncome ? "Editar Receita" : "Nova Receita"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome da Renda</Label>
                <Input
                  id="name"
                  placeholder="Ex: Salário, Freelance..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Recorrência</Label>
                  <Select
                    value={formData.recurrence}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        recurrence: v as (typeof EMPTY_FORM)["recurrence"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {RECURRENCE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiveDate">Dia do Recebimento</Label>
                  <Input
                    id="receiveDate"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.receiveDate}
                    onChange={(e) =>
                      setFormData({ ...formData, receiveDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isSaving}>
                {editingIncome ? "Salvar Alterações" : "Adicionar Receita"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-success/20 p-6 shadow-sm animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-success/10">
            <Wallet className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total de Receitas</p>
            <p className="text-3xl font-bold text-success">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="animate-fade-up">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-card rounded-xl border border-border p-5 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-muted rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : incomes.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma receita cadastrada
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Comece adicionando suas fontes de renda para ter controle total
              das suas finanças.
            </p>

            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" />
              Adicionar Receita
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {incomes.map((income) => (
              <div
                key={income.id}
                className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-success/10 shrink-0">
                      <Wallet className="w-5 h-5 text-success" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-foregorund">
                        {income.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <RefreshCw className="w-3 h-3" />
                          {RECURRENCE_LABELS[income.recurrence] ??
                            income.recurrence}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Dia {income.receiveDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-success hidden sm:block">
                      {formatCurrency(income.amount)}
                    </span>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(income)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(income.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border sm:hidden">
                  <span className="text-lg font-bold text-success">
                    {formatCurrency(income.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
