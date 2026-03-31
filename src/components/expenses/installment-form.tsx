'use client';

import type { CreateInstallmentPayload } from "@/lib/api/installments";
import type { ExpenseCategory } from "@/types";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface InstallmentFormProps {
  categories: ExpenseCategory[];
  onSubmit: (payload: CreateInstallmentPayload) => Promise<void>;
  onCancel: () => void;
}

export function InstallmentForm({ categories, onSubmit, onCancel }: InstallmentFormProps) {
  const [form, setForm] = useState({
    description: '',
    totalAmount: '',
    installments: '2',
    categoryId: '',
    firstInstallmentDate: new Date().toISOString().split('T')[0]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const installmentAmount =
    form.totalAmount && form.installments
      ? (parseFloat(form.totalAmount) / parseInt(form.installments)).toFixed(2)
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {

      await onSubmit({
        description: form.description.trim(),
        totalAmount: parseFloat(form.totalAmount),
        installments: parseInt(form.installments),
        firstInstallmentDate: form.firstInstallmentDate,
        ...(form.categoryId && form.categoryId !== 'none'
          ? { categoryId: parseInt(form.categoryId) }
          : {}),
      })

    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : (msg ?? "Erro ao salvar parcelamento"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="inst-desc">Descrição</Label>
        <Input
          id="inst-desc"
          placeholder="Ex: iPhone, Notebook, Sofá..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="inst-total">Valor Total (R$)</Label>
          <Input
            id="inst-total"
            type="number"
            step='0.01'
            min='0.01'
            placeholder="0,00"
            value={form.totalAmount}
            onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inst-n">Nº de Parcelas</Label>
          <Input
            id="inst-n"
            type="number"
            min='2'
            max='60'
            value={form.installments}
            onChange={(e) => setForm({ ...form, installments: e.target.value })}
            required
          />
        </div>
      </div>

      {installmentAmount && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm">
          <span className="text-muted-foreground">Valor por parcela: </span>
          <span className="font-semibold text-primary">
            {parseInt(form.installments)}x de R${" "}
            {parseFloat(installmentAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select
            value={form.categoryId}
            onValueChange={(v) => setForm({ ...form, categoryId: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder='Selecionar...' />
            </SelectTrigger>

            <SelectContent>
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
          <Label>1ª Parcela</Label>
          <Input
            id="inst-date"
            type="date"
            value={form.firstInstallmentDate}
            onChange={(e) => setForm({ ...form, firstInstallmentDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1" isLoading={isSaving}>
          Criar Parcelamento
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}