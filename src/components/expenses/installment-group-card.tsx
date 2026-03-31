import { DeleteInstallmentPayload, UpdateInstallmentPayload } from "@/lib/api/installments";
import { cn, formatCurrency, formatDateSafe } from "@/lib/utils";
import { Expense, type InstallmentGroup } from "@/types";
import { AlertCircle, Calendar, ChevronDown, ChevronUp, CreditCard, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InstallmentGroupCardProps {
  group: InstallmentGroup;
  onUpdate: (expenseId: number, payload:UpdateInstallmentPayload) => Promise<void>;
  onDelete: (expenseId: number, payload: DeleteInstallmentPayload) => Promise<void>;
} 

export function InstallmentGroupCard({ group, onUpdate, onDelete}: InstallmentGroupCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState({ description: '', amount: ''});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const paidCount = group.expenses.filter((e) => new Date(e.date) < today).length;
  const totalCount = group.expenses.length;
  const paidAmount = group.expenses
    .filter((e) => new Date(e.date) < today)
    .reduce((s, e) => s + Number(e.amount), 0)
  const pendingAmount = group.expenses
    .filter((e) => new Date(e.date) >= today)
    .reduce((s, e) => s + Number(e.amount), 0);

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    const baseName = expense.description.replace(/\s+\d+\/\d+$/, '');
    setEditForm({description:baseName, amount: String(expense.amount)})
    setError(null);
  }

  async function handleEditSubmit(e: React.FormEvent, scope: 'this' | 'future') {
    e.preventDefault();
    if(!editingExpense) return;
    setError(null);
    setIsSaving(true);
     try {
      await onUpdate(editingExpense.id, {
        scope,
        description: editForm.description.trim() || undefined,
        amount: editForm.amount ? parseFloat(editForm.amount) : undefined,
      });
      setEditingExpense(null);
    } catch {
      setError("Erro ao salvar alterações");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(scope: "this" | "future") {
    if (!deletingExpense) return;
    setIsSaving(true);
    try {
      await onDelete(deletingExpense.id, { scope });
      setDeletingExpense(null);
    } catch {
      setError("Erro ao excluir parcela");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg shrink-0" style={{ backgroundColor: group.category ? `${group.category.color}20` : undefined }}>
                <CreditCard 
                  className="w-5 h-5"
                  style={{ color: group.category?.color ?? 'var(--color-muted-foreground)'}}
                />
              </div>

              <div>
                <h3 className="font-semibold text-foreground">{group.description}</h3>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {group.category && (
                    <span className="flex items-center gap-1 text-xs">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: group.category.color }} />
                      <span className="text-muted-foreground">{group.category.name}</span>
                    </span>
                  )}

                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    paidCount === totalCount
                      ? "bg-success/10 text-success"
                      : 'bg-primary/10 text-primary'
                  )}>
                    {paidCount}/{totalCount} parcelas
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">
                  Pago: <span className="text-foreground font-medium">{formatCurrency(paidAmount)}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Restante: <span className="text-destructive font-medium">{formatCurrency(pendingAmount)}</span>
                </p>
              </div>

              <Button variant='ghost' size='icon' onClick={() => setExpanded(!expanded)} title={expanded ? 'Recolher' : 'Expandir parcelas'} >
                {expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
              </Button>
            </div>
          </div>

          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(paidCount / totalCount) * 100}$` }}
            />
          </div>
        </div>

        {expanded && (
          <div className="border-t border-border divide-y divide-border/50">
            {group.expenses.map((expense) => {
              const isPast = new Date(expense.date) > today;

              return (
                <div
                  key={expense.id}
                  className={cn(
                    'flex items-center justify-between px-5 py-3',
                    isPast ? 'opacity-60' : ''
                  )}
                >
                  <div className="flex items-center gap-3"> 
                    <span className={cn(
                      'text-xs font-medium w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      isPast ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                    )}>
                      {expense.installmentNumber}
                    </span>

                    <div>
                      <p className="text-sm font-medium text-foreground">{expense.description}</p>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDateSafe(expense.date)}
                        {isPast && <span className="ml-1 text-success">• paga</span>}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-destructive">
                      -{formatCurrency(expense.amount)}
                    </span>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(expense)}>
                        <Edit2 className='w-3.5 h-3.5' />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => {setDeletingExpense(expense); setError(null); }}>
                        <Trash2 className="w-3.5 h-3.5"/>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>  
        )}
      </div>

      <Dialog open={!!editingExpense} onOpenChange={(o) => !o && setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Parcela {editingExpense?.installmentNumber}/{totalCount}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            <div className="space-y-2">
              <Label>Descrição base</Label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Nome da compra"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor da parcela (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                isLoading={isSaving}
                onClick={(e) => handleEditSubmit(e as unknown as React.FormEvent, "this")}
              >
                Só esta parcela
              </Button>
              <Button
                type="button"
                isLoading={isSaving}
                onClick={(e) => handleEditSubmit(e as unknown as React.FormEvent, "future")}
              >
                Esta e as futuras
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingExpense} onOpenChange={(o) => !o && setDeletingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Parcela</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Parcela {deletingExpense?.installmentNumber}/{totalCount} —{" "}
            <strong>{formatCurrency(deletingExpense?.amount ?? 0)}</strong>
            <br />Como deseja excluir?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              isLoading={isSaving}
              onClick={() => handleDelete("this")}
            >
              Só esta parcela
            </Button>
            <Button
              className="bg-destructive hover:opacity-90 text-destructive-foreground"
              isLoading={isSaving}
              onClick={() => handleDelete("future")}
            >
              Esta e as futuras
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>


  )
}