"use client";

import { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  Calendar,
  Tag,
  Settings,
  AlertCircle,
} from "lucide-react";
import { useExpenses } from "@/hooks/use-expenses";
import { useCategories } from "@/hooks/use-categories";
import type { Expense, ExpenseCategory } from "@/types";
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
  const { expenses, isLoading, error, totalAmount, create, update, remove } =
    useExpenses();
  const {
    categories,
    create: createCategory,
    update: updateCategory,
    remove: removeCategory,
  } = useCategories();

  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE_FORM);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<ExpenseCategory | null>(null);

  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

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
    setCategoryForm({
      name: category.name,
      color: category.color,
      icon: category.icon,
    });
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

  async function handleExpenseSubmit(e: React.FormEvent) {
    e.preventDefault();
    setExpenseError(null);
    setIsSavingExpense(true);

    try {
      const payload = {
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description.trim(),
        ...(expenseForm.categoryId
          ? { categoryId: parseInt(expenseForm.categoryId, 10) }
          : {}),
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
    } catch (err) {
      setCategoryError(extractErrorMessage(err));
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleDeleteExpense(id: number) {
    if (!confirm("Deseja realmente excluir esta despesa?")) return;
    try {
      await remove(id);
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  async function handleDeleteCategory(id: number) {
    if (
      !confirm(
        "Deseja excluir esta categoria? As despesas vinculadas ficarão sem categoria",
      )
    )
      return;
    try {
      await removeCategory(id);
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  function getCategoryById(id: number | null | undefined) {
    if (!id) return null;
    return categories.find((c) => c.id === id) ?? null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Despesas
          </h1>
          <p className="text-muted-foreground mt-1">
            Controle seus gastos mensais
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog
            open={isCategoryOpen}
            onOpenChange={(open) => !open && closeCategoryDialog()}
          >
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsCategoryOpen(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gerenciar Categorias</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCategorySubmit} className="space-y-3">
                {categoryError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg pg-3 py-2">
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
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          color: e.target.value,
                        })
                      }
                      className="w-12 h-10 rounded-lg border border-input cursor-pointer p-1"
                    />
                    <Input
                      value={categoryForm.color}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          color: e.target.value,
                        })
                      }
                      placeholder="#FF6B35"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isSavingCategory}
                  >
                    {editingCategory ? "Salvar" : "Criar Categoria"}
                  </Button>
                  {editingCategory && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm(EMPTY_CATEGORY_FORM);
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isExpenseOpen}
            onOpenChange={(open) => !open && closeExpenseDialog()}
          >
            <DialogTrigger asChild>
              <Button onClick={openCreateExpense}>
                <Plus className="w-4 h-4" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? "Editar Despesa" : "Nova Despesa"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                {expenseError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg pg-3 py-2">
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
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expDesc">Descrição</Label>
                  <Input
                    id="expDesc"
                    placeholder="Ex: Almoço, Uber, Mercado..."
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={expenseForm.categoryId}
                      onValueChange={(v) =>
                        setExpenseForm({ ...expenseForm, categoryId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
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
                      onChange={(e) =>
                        setExpenseForm({ ...expenseForm, date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" isLoading={isSavingExpense}>
                  {editingExpense ? 'Salvar Alterações' : 'Adicionar Despesa'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {error && (
        <div className="flex items-cecnter gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      
      <div className="bg-card rounded-2xl border border-destructive/20 p-6 shadow-sm animate-fade-up">
        <div className="flex items-center gap-4">
          
          <div className="p-4 rounded-xl bg-destructive/10">
            <CreditCard className="w-6 h-6 text-destructive" />
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Total de despesas</p>
            <p className="text-3xl font-bold text-destructive">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>
      
      <div className="animate-fade-up">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-card rounded-xl border border-border p-5 animate-pulse">
              </div>
            ))}
          </div>
        ) : ()}
      </div>
    </div>
  );
}
