export interface User {
    id: number;
    email: string;
    fullName: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Income {
    id: number;
    userId: number;
    name: string;
    amount: string;
    recurrence: string;
    receiveDate: number;
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseCategory {
    id: number;
    userId: number;
    name: string;
    color: string;
    icon: string;
}

export interface InstallmentGroup {
    id: number;
    userId: number;
    categoryId: number | null;
    description: string;
    totalAmount: number;
    installments: number;
    createdAt: string;
    updatedAt: string;
    category: ExpenseCategory | null;
    expenses: Expense[];
}

export interface Expense {
    id: number;
    userId: number;
    categoryId: number | null;
    installmentGroupId: number | null;
    installmentNumber: number | null;
    amount: string;
    description: string;
    date: string;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    category?: ExpenseCategory | null;
}

export interface PiggyBank {
    id: number;
    userId: number;
    name: string;
    goal: string | null;
    bank: string;
    balance: string;
    createdAt: string;
    updatedAt: string;
}

export interface PiggyTransaction {
    id: number;
    piggyBankId: number;
    userId: number;
    type: 'deposit' | 'withdrawal';
    amount: string;
    description: string | null;
    date: string;
    createdAt: string;
}

export const DEFAULT_BANKS = [
    'Inter', 'Nubank', 'Xp Investimentos', 'Santander',
    'Itaú', 'Bradesco', 'Caixa', 'Banco do Brasil',
    'C6 Bank', 'Pic Pay', 'Outro'
] as const;

export const RECURRENCE_OPTIONS = [
    { value: 'none', label: 'Não recorrente' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'weekly', label: 'Semanal' }
] as const;

export interface MonthlyReport {
    totalIncomes: number;
    totalExpenses: number;
    totalPaid: number;
    totalPending: number;
    balance: number;
    totalSavings: number;
    expensesByCategory: {
        categoryId: number;
        categoryName: string;
        categoryColor: string;
        categoryIcon: string;
        total: number;
        count: number;
        percentage: number;
    }[];
}

export interface MonthlyDataPoint {
  month: number;
  monthName: string;
  incomes: number;
  expenses: number;
  balance: number;
}

export interface AnnualReport {
  year: number;
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
  monthlyData: MonthlyDataPoint[];
}

export interface MonthComparison {
  currentMonth:  { total: number; month: number };
  previousMonth: { total: number; month: number };
  difference: number;
  percentageChange: number;
  trend: "increase" | "decrease" | "stable";
}