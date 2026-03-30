'use client';

import React, { useState } from "react";
import {
  Plus, Edit2, Trash2, PiggyBank as PiggyBankIcon,
  ArrowUpCircle, ArrowDownCircle, Building2,
  Target, History, AlertCircle
} from 'lucide-react'
import { usePiggys } from "@/hooks/use-piggys";
import type { PiggyBank } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, extractErrorMessage, formatDateSafe } from "@/lib/utils";
import { DEFAULT_BANKS } from "@/types";
import { cn } from "@/lib/utils";

const EMPTY_PIGGY_FORM = { name: '', goal: '', bank: '' };
const EMPTY_TX_FORM = { amount: '', description: '' };

export default function PiggysPage() {
  const {
    piggyBanks, isLoading, error, totalSavings,
    transactionMap, loadTransactions,
    createPiggy, updatePiggy, removePiggy, createTransaction
  } = usePiggys()

  const [isPiggyOpen, setIsPiggyOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [selectedPiggy, setSelectedPiggy] = useState<PiggyBank | null>(null);
  const [editingPiggy, setEditingPiggy] = useState<PiggyBank | null>(null);
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit');

  const [piggyForm, setPiggyForm] = useState(EMPTY_PIGGY_FORM);
  const [txForm, setTxForm] = useState(EMPTY_TX_FORM);

  const [isSavingPiggy, setIsSavingPiggy] = useState(false);
  const [isSavingTx, setIsSavingTx] = useState(false);
  const [piggyError, setPiggyError] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  function openCreatePiggy() {
    setEditingPiggy(null);
    setPiggyForm(EMPTY_PIGGY_FORM);
    setPiggyError(null);
    setIsPiggyOpen(true);
  }

  function openEditPiggy(piggy: PiggyBank) {
    setEditingPiggy(piggy);
    setPiggyForm({ name: piggy.name, goal: piggy.goal ?? '', bank: piggy.bank });
    setPiggyError(null);
    setIsPiggyOpen(true);
  }

  function closePiggyDialog() {
    setIsPiggyOpen(false);
    setTimeout(() => {
      setEditingPiggy(null);
      setPiggyForm(EMPTY_PIGGY_FORM);
      setPiggyError(null);
    }, 200)
  }

  function openTransaction(piggy: PiggyBank, type: 'deposit' | 'withdrawal') {
    setSelectedPiggy(piggy);
    setTxType(type);
    setTxForm(EMPTY_TX_FORM);
    setTxError(null);
    setIsTransactionOpen(true);
  }

  async function openHistory(piggy: PiggyBank) {
    setSelectedPiggy(piggy);
    setIsHistoryOpen(true);

    if (!transactionMap[piggy.id]) {
      await loadTransactions(piggy.id)
    }
  }

  async function handlePiggySubmit(e: React.FormEvent) {
    e.preventDefault();
    setPiggyError(null);
    setIsSavingPiggy(true);

    try {
      const payload = {
        name: piggyForm.name.trim(),
        ...(piggyForm.goal.trim() ? { goal: piggyForm.goal.trim() } : {}),
        bank: piggyForm.bank
      };

      if (editingPiggy) {
        await (updatePiggy(editingPiggy.id, payload));
      } else {
        await createPiggy(payload)
      }

      closePiggyDialog();
    } catch (err) {
      setPiggyError(extractErrorMessage(err))
    } finally {
      setIsSavingPiggy(false);
    }
  }

  async function handleTransactionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPiggy) return;

    if (txType === 'withdrawal' && parseFloat(txForm.amount) > Number(selectedPiggy.balance)) {
      setTxError('Saldo insuficiente no cofrinho');
      return;
    }

    setTxError(null);
    setIsSavingTx(true);

    try {
      await createTransaction({
        piggyBankId: selectedPiggy.id,
        type: txType,
        amount: parseFloat(txForm.amount),
        ...(txForm.description.trim() ? { description: txForm.description.trim() } : {})
      })
      setIsTransactionOpen(false);
    } catch (err) {
      setTxError(extractErrorMessage(err));
    } finally {
      setIsSavingTx(false)
    }
  }

  async function handleDeletePiggy(id: number) {
    if (!confirm("Deseja excluir este cofrinho? Todas as transações serão perdidas.")) return;
    try {
      await removePiggy(id);
    } catch (err) {
      alert(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-8">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Cofrinhos</h1>
          <p className="text-muted-foreground mt-1">Organize suas poupanças e metas</p>
        </div>

        <Dialog open={isPiggyOpen} onOpenChange={(open) => !open && closePiggyDialog()}>
          <DialogTrigger asChild>
            <Button onClick={openCreatePiggy}>
              <Plus className="w-4 h-4" />
              Novo Cofrinho
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPiggy ? 'Editar Cofrinho' : 'Novo Cofrinho'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handlePiggySubmit} className="space-y-4">
              {piggyError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4" />
                  {piggyError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="piggyName">Nome do Cofrinho</Label>
                <Input
                  id="piggyName"
                  placeholder="Ex: Reserva de Emergência, Viagem..."
                  value={piggyForm.name}
                  onChange={(e) => setPiggyForm({ ...piggyForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="piggyGoal">Objetivo <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <Input
                  id="piggyGoal"
                  placeholder="Para que você está guardando?"
                  value={piggyForm.goal}
                  onChange={(e) => setPiggyForm({ ...piggyForm, goal: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Banco</Label>
                <Select
                  value={piggyForm.bank}
                  onValueChange={(v) => setPiggyForm({ ...piggyForm, bank: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Onde o dinheiro está guardado?" />
                  </SelectTrigger>

                  <SelectContent>
                    {DEFAULT_BANKS.map((bank) => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" isLoading={isSavingPiggy}>
                {editingPiggy ? 'Salvar Alterações' : 'Criar cofrinho'}
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

      {/* Card Total */}
      <div className="bg-card rounded-2xl border border-primary/20 p-6 shadow-sm animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-primary/10">
            <PiggyBankIcon className="w-6 h-6 text-primary" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Total Guardado</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalSavings)}</p>
          </div>
        </div>
      </div>

      {/* Dialog de Transação */}
      <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{txType === 'deposit' ? 'Depositar' : 'Retirar'} - {selectedPiggy?.name}</DialogTitle>
          </DialogHeader>

          {selectedPiggy && (
            <p className="text-sm text-muted-foreground -mt-2 mb-2">
              Saldo atual: <span className="font-medium text-foreground">{formatCurrency(Number(selectedPiggy.balance))}</span>
            </p>
          )}

          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            {txError && (
              <div className="felx items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {txError}
              </div>
            )}

            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                id="txAmount"
                type="number"
                step='0.01'
                min='0.01'
                placeholder="0,00"
                value={txForm.amount}
                onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="txDesc">Descrição <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input
                id="txDesc"
                placeholder="Motivo da movimentação..."
                value={txForm.description}
                onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className={cn('w-full', txType === 'withdrawal' && "bg-destructive hover:opacity-90")}
              isLoading={isSavingTx}
            >
              {txType === 'deposit' ? 'Confirmar Depósito' : 'Confirmar Retirada'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Histórico - {selectedPiggy?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {selectedPiggy && !transactionMap[selectedPiggy.id] ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : selectedPiggy && (transactionMap[selectedPiggy.id] ?? []).length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Nenhuma movimentação registrada.
              </p>
            ) : (
              (selectedPiggy ? transactionMap[selectedPiggy.id] ?? [] : []).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    {txType === 'deposit' ? (
                      <ArrowUpCircle className="w-5 h-5 text-success shrink-0" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-destructive shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type === 'deposit' ? 'Depósito' : 'Retirada'}
                      </p>
                      <p className="text-tx text-muted-foreground">{formatDateSafe(tx.date)}</p>
                      {tx.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{tx.description}</p>
                      )}
                    </div>
                  </div>
                  <span className={cn('font-semibold text-sm', tx.type === 'deposit' ? 'text-success' : 'text-destructive')}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Grid de Cofrinhos */}
      <div className="animate-fade-up">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-card rounded-2xl border border-border p-6 animate-pulse">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="h-8 bg-muted rounded w-1/2 mb-4" />
                <div className="h-9 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : piggyBanks.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <PiggyBankIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum cofrinho criado</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Crie cofrinhos para organizar suas poupanças e atingir seus objetivos</p>
            <Button onClick={openCreatePiggy}>
              <Plus className="w-4 h-4" />
              Criar Cofrinho
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {piggyBanks.map((piggy) => (
              <div key={piggy.id} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <PiggyBankIcon className="w-6 h-6 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">{piggy.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {piggy.bank}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => openEditPiggy(piggy)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeletePiggy(piggy.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {piggy.goal && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <Target className="w-3 h-3 shrink-0" />
                    {piggy.goal}
                  </p>
                )}
                <p className="text-2xl font-bold text-primary mb-4">
                  {formatCurrency(Number(piggy.balance))}
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => openTransaction(piggy, 'deposit')}
                  >
                    <ArrowUpCircle className="w-4 h-4 text-success"/>
                    Depositar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() =>openTransaction(piggy, 'withdrawal')}
                  >
                    <ArrowDownCircle className="w-4 h-4 text-destructive" />
                    Retirar
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2"
                    onClick={() => openHistory(piggy)}
                    title="Ver histórico"
                  >
                    <History className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}