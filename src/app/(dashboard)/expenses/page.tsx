"use client";

import { useState } from "react";
import {
  Plus, Edit2, Trash2, CreditCard, Calendar,
  Tag, Settings, AlertCircle, CreditCard as CreditCardInstallment
} from "lucide-react";
import { useExpenses } from "@/hooks/use-expenses";
import { useCategories } from "@/hooks/use-categories";
import { useInstallments } from "@/hooks/use-installments";
import type { Expense, ExpenseCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, extractErrorMessage, formatDateSafe } from "@/lib/utils";
import { InstallmentForm } from "@/components/expenses/installment-form";
import { InstallmentGroupCard } from "@/components/expenses/installment-group-card";


const EMPTY_EXPENSE_FORM = {
  amount: "",
  description: "",
  categoryId: "",
  date: new Date().toISOString().split("T")[0],
};

const EMPTY_CATEGORY_FORM = {
  name: "",
  color: "#FF6B35",
  icon: "tag",
};

export default function ExpensesPage() {
  const { expenses, isLoading, error, totalAmount, create, update, remove } = useExpenses();
  const { categories, create: createCategory, update: updateCategory, remove: removeCategory } = useCategories();
  const { groups, isLoading: isLoadingInstallments, totalPending, create: createInstallment, updateExpense: updateInstallmentExpense, deleteExpense: deleteInstallmentExpense } = useInstallments();

  // --- Estado dos Dialogs ---
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isInstallmentOpen, setIsInstallmentOpen] = useState(false);

  // --- Estado dos Forms ---
  const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE_FORM);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);

  // --- Estado de edição ---
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  // --- Estado de submissão ---
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // --- Handlers de abertura ---
  function openCreateExpense() {
    setEditingExpense(null);
    setExpenseForm(EMPTY_EXPENSE_FORM);
    setExpenseError(null);
    setIsExpenseOpen(true);
  }

  function openEditExpense(expense: Expense) {
    setEditingExpense(expense);
    setExpenseForm({
      amount: String(expense.amount),
      description: expense.description,
      categoryId: expense.categoryId ? String(expense.categoryId) : "",
      date: expense.date.split("T")[0],
    });
    setExpenseError(null);
    setIsExpenseOpen(true);
  }

  function closeExpenseDialog() {
    setIsExpenseOpen(false);
    setTimeout(() => {
      setEditingExpense(null);
      setExpenseForm(EMPTY_EXPENSE_FORM);
      setExpenseError(null);
    }, 200);
  }

  function openEditCategory(category: ExpenseCategory) {
    setEditingCategory(category);
    setCategoryForm({ name: category.name, color: category.color, icon: category.icon });
    setCategoryError(null);
  }

  function closeCategoryDialog() {
    setIsCategoryOpen(false);
    setTimeout(() => {
      setEditingCategory(null);
      setCategoryForm(EMPTY_CATEGORY_FORM);
      setCategoryError(null);
    }, 200);
  }

  // --- Submit de Despesa ---
  async function handleExpenseSubmit(e: React.FormEvent) {
    e.preventDefault();
    setExpenseError(null);
    setIsSavingExpense(true);
    try {
      const payload = {
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description.trim(),
        ...(expenseForm.categoryId ? { categoryId: parseInt(expenseForm.categoryId, 10) } : {}),
        date: expenseForm.date,
      };

      if (editingExpense) {
        await update(editingExpense.id, payload);
      } else {
        await create(payload);
      }
      closeExpenseDialog();
    } catch (err) {
      setExpenseError(extractErrorMessage(err));
    } finally {
      setIsSavingExpense(false);
    }
  }

  // --- Submit de Categoria ---
  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    setCategoryError(null);
    setIsSavingCategory(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryForm);
      } else {
        await createCategory(categoryForm);
      }
      setEditingCategory(null);
      setCategoryForm(EMPTY_CATEGORY_FORM);
    } catch (err) {
      setCategoryError(extractErrorMessage(err));
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleDeleteExpense(id: number) {
    if (!confirm("Deseja realmente excluir esta despesa?")) return;
    try { await remove(id); } catch (err) { alert(extractErrorMessage(err)); }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Deseja excluir esta categoria? As despesas vinculadas ficarão sem categoria.")) return;
    try { await removeCategory(id); } catch (err) { alert(extractErrorMessage(err)); }
  }

  // Helper: busca objeto de categoria pelo ID
  function getCategoryById(id: number | null | undefined) {
    if (!id) return null;
    return categories.find((c) => c.id === id) ?? null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Despesas</h1>
          <p className="text-muted-foreground mt-1">Controle seus gastos mensais</p>
        </div>

        <div className="flex gap-2">
          {/* Dialog de Categorias */}
          <Dialog open={isCategoryOpen} onOpenChange={(open) => !open && closeCategoryDialog()}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsCategoryOpen(true)}>
                <Settings className="w-4 h-4" />
                Categorias
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerenciar Categorias</DialogTitle>
              </DialogHeader>

              {/* Form de criação/edição */}
              <form onSubmit={handleCategorySubmit} className="space-y-3">
                {categoryError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {categoryError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="catName">Nome</Label>
                  <Input
                    id="catName"
                    placeholder="Ex: Alimentação, Lazer..."
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      className="w-12 h-10 rounded-lg border border-input cursor-pointer p-1"
                    />
                    <Input
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      placeholder="#FF6B35"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1" isLoading={isSavingCategory}>
                    {editingCategory ? "Salvar" : "Criar Categoria"}
                  </Button>
                  {editingCategory && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setEditingCategory(null); setCategoryForm(EMPTY_CATEGORY_FORM); }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>

              {/* Lista de categorias existentes */}
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Categorias existentes
                </p>
                <div className="space-y-1 max-h-52 overflow-y-auto">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-accent"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => openEditCategory(cat)}>
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCategory(cat.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Dialog de Nova/Editar Despesa */}
          <Dialog open={isExpenseOpen} onOpenChange={(open) => !open && closeExpenseDialog()}>
            <DialogTrigger asChild>
              <Button onClick={openCreateExpense}>
                <Plus className="w-4 h-4" />
                Nova Despesa
              </Button>
              <Button variant="outline" onClick={() => setIsInstallmentOpen(true)}>
                <CreditCardInstallment className="w-4 h-4" />
                Parcelado
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingExpense ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                {expenseError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {expenseError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="expAmount">Valor (R$)</Label>
                  <Input
                    id="expAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expDesc">Descrição</Label>
                  <Input
                    id="expDesc"
                    placeholder="Ex: Almoço, Uber, Mercado..."
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={expenseForm.categoryId}
                      onValueChange={(v) => setExpenseForm({ ...expenseForm, categoryId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Opção para remover categoria */}
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expDate">Data</Label>
                    <Input
                      id="expDate"
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" isLoading={isSavingExpense}>
                  {editingExpense ? "Salvar Alterações" : "Adicionar Despesa"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isInstallmentOpen} onOpenChange={setIsInstallmentOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Compra Parcelada</DialogTitle>
              </DialogHeader>
              <InstallmentForm
                categories={categories}
                onSubmit={async (payload) => {
                  await createInstallment(payload);
                  setIsInstallmentOpen(false);
                }}
                onCancel={() => setIsInstallmentOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Erro de carregamento */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Card total */}
      <div className="bg-card rounded-2xl border border-destructive/20 p-6 shadow-sm animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-destructive/10">
            <CreditCard className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total de Despesas</p>
            <p className="text-3xl font-bold text-destructive">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="animate-fade-up">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/5" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="h-6 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma despesa registrada</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Registre seus gastos para ter controle total do seu dinheiro.
            </p>
            <Button onClick={openCreateExpense}>
              <Plus className="w-4 h-4" />
              Adicionar Despesa
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {expenses.map((expense) => {
              const category = getCategoryById(expense.categoryId);
              return (
                <div
                  key={expense.id}
                  className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Ícone com cor da categoria */}
                      <div
                        className="p-3 rounded-lg shrink-0"
                        style={{ backgroundColor: category ? `${category.color}20` : undefined }}
                      >
                        <Tag
                          className="w-5 h-5"
                          style={{ color: category?.color ?? "var(--color-muted-foreground)" }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{expense.description}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {category && (
                            <span className="flex items-center gap-1 text-xs">
                              <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-muted-foreground">{category.name}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDateSafe(expense.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-destructive hidden sm:block">
                        -{formatCurrency(expense.amount)}
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditExpense(expense)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Valor no mobile */}
                  <div className="mt-3 pt-3 border-t border-border sm:hidden">
                    <span className="text-lg font-bold text-destructive">
                      -{formatCurrency(expense.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Seção de Parcelamentos */}
      {(groups.length > 0 || isLoadingInstallments) && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Compras Parceladas</h2>
              <p className="text-sm text-muted-foreground">
                Total pendente:{" "}
                <span className="font-medium text-destructive">{formatCurrency(totalPending)}</span>
              </p>
            </div>
          </div>

          {isLoadingInstallments ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="bg-card rounded-xl border border-border p-5 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg bg-muted shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-2/5" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <InstallmentGroupCard
                  key={group.id}
                  group={group}
                  onUpdate={updateInstallmentExpense}
                  onDelete={deleteInstallmentExpense}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}