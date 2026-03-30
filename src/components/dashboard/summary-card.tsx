import { cn, formatCurrency } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import React from 'react'

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'income' | 'expense' | 'savings';
  subtitle?: string;
}

const styles = {
  card: { default: 'border-border', income: 'border-success/20', expense: 'border-destructive/20', savings: 'border-primary/20' },
  icon: { default: "bg-muted text-muted-foreground", income: "bg-success/10 text-success", expense: "bg-destructive/10 text-destructive", savings: "bg-primary/10 text-primary" },
  value: { default: "text-foreground", income: "text-success", expense: "text-destructive", savings: "text-primary" },
}

export function SummaryCard({ title, value, icon: Icon, variant = 'default', subtitle }: SummaryCardProps) {
  return (
    <div className={cn('bg-card rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow', styles.card[variant])}>
      <div className='flex items-start justify-between'>
        <div className='space-y-1'>
          <p className='text-sm font-medium text-muted-foreground'>{title}</p>
          <p className={cn('text-2xl font-bold tracking-tight', styles.value[variant])}>{formatCurrency(value)}</p>
          {subtitle && <p className='text-xs text-muted-foreground'>{subtitle}</p>}
        </div>
        <div className={cn('p-3 rounded-xl', styles.icon[variant])}>
          <Icon className='w-5 h-5' />
        </div>
      </div>
    </div>
  )
}