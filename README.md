# FinanceHub Web

> A personal finance dashboard built with Next.js 15 — visualize income, expenses, savings, and financial trends through an interactive, data-rich interface.

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-UNLICENSED-gray.svg?style=for-the-badge)](LICENSE)

![Project Preview](https://github.com/user-attachments/assets/08c68044-5684-4a48-90ac-5cb480492361)
![Project Preview](https://github.com/user-attachments/assets/6773bde9-9b08-4350-9e08-dc3cd512c21f)
![Project Preview](https://github.com/user-attachments/assets/a34190ee-9f54-4a95-b1f6-04567e601087)
![Project Preview](https://github.com/user-attachments/assets/6757cadd-aee2-4238-822c-732f9fe9350f)
![Project Preview](https://github.com/user-attachments/assets/28c23cc2-36a0-4228-b76e-474b6973a9f8)
![Project Preview](https://github.com/user-attachments/assets/d7e35cb0-f0ad-4a2e-b65d-74da443e9152)

**🔗 Related repository: [FinanceHub API (backend)](https://github.com/Luan-Neumann-Dev/finance-hub-api-nestjs)**

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [What I Learned](#-what-i-learned)
- [Roadmap](#-roadmap)

## 🎯 About The Project

FinanceHub Web is the frontend application for FinanceHub — a full-stack personal finance management system. The dashboard gives users a clear, real-time picture of their financial health: monthly income vs. expenses, category breakdowns, savings progress across multiple piggy banks, and installment purchase tracking.

The application is built with Next.js 15 App Router and TypeScript, using a route-group architecture to cleanly separate authenticated dashboard pages from public auth flows. All data fetching is handled through custom React hooks that communicate with the FinanceHub REST API, with cookie-based JWT storage managed via `js-cookie`.

A key design decision was keeping the frontend purely presentational: no business logic lives in the client. The API handles all financial calculations (recurring income normalization, installment generation, report aggregation), and the frontend is responsible only for rendering that data clearly and responsively.

### Why I Built This

This project was built as the frontend counterpart to the FinanceHub API, with a focus on practicing Next.js 15 App Router patterns, building reusable data visualization components with Recharts, and handling authentication state cleanly across a multi-page application without a state management library.

## ✨ Features

### Core Pages
- 📊 **Dashboard** — Monthly summary cards (income, expenses, balance, savings), expense pie chart by category, annual income vs. expense bar chart, and AI-style financial insights
- 💸 **Expenses** — Browse and manage expenses; installment purchases are grouped visually with progress tracking per installment
- 💰 **Incomes** — Manage income sources with recurrence type and receive date
- 🐷 **Piggy Banks** — View all savings accounts, track deposits and withdrawals, monitor progress toward named goals
- 📈 **Reports** — Period-range and annual reporting views

### User Experience
- Skeleton loading states on every page — no layout shift during data fetching
- Responsive layout with a collapsible sidebar for mobile
- Animated page transitions with `animate-fade-up`
- Financial insight cards that surface spending trends automatically (e.g. "You spent 82% of your income this month", "Expenses dropped 12% vs last month")
- Contextual color coding: income green, expense red, savings blue

### Technical Features
- Auth-protected routes via Next.js Middleware — redirects unauthenticated users without a client-side flash
- Cookie-based JWT persistence using `js-cookie`
- Centralized Axios instance with base URL from environment and automatic auth header injection
- Custom hooks per domain (`useExpenses`, `useIncomes`, `usePiggys`, `useDashboard`, etc.)
- Radix UI primitives (Dialog, Select, Tabs, Label) for accessible modals and forms

## 🛠️ Tech Stack

**Framework & Language:**
- Next.js 15 (App Router) — file-based routing, route groups, layouts, loading.tsx
- React 18 — hooks, context, client components
- TypeScript 5 — full type coverage

**Styling:**
- Tailwind CSS v4 — utility-first styling
- `class-variance-authority` + `clsx` + `tailwind-merge` — variant-safe class composition (shadcn/ui pattern)
- Lucide React — icon library

**Data & Charts:**
- Recharts — `BarChart` (annual overview) and `PieChart` (expense by category)
- Axios — HTTP client with interceptor-ready instance
- `js-cookie` — client-side cookie access for JWT

**UI Components:**
- Radix UI — Dialog, Select, Tabs, Label, Slot (headless, accessible primitives)

**Development Tools:**
- ESLint (Next.js config)
- Prettier
- TypeScript strict mode

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10
- FinanceHub API running on `http://localhost:3333`

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/finance-hub-web.git
cd finance-hub-web
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

4. **Configure `.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```

5. **Start the development server**
```bash
npm run dev
```

6. **Access the application**
```
http://localhost:3000
```

> Make sure the [FinanceHub API](https://github.com/Luan-Neumann-Dev/finance-hub-api) is running before starting the web app.

## 📁 Project Structure

```
finance-hub-web/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth route group (no sidebar layout)
│   │   │   └── login/
│   │   ├── (dashboard)/         # Protected route group (sidebar layout)
│   │   │   ├── dashboard/
│   │   │   ├── expenses/
│   │   │   ├── incomes/
│   │   │   ├── piggys/
│   │   │   ├── reports/
│   │   │   └── layout.tsx       # Sidebar + auth check
│   │   ├── layout.tsx           # Root layout (fonts, providers)
│   │   └── page.tsx             # Redirect to /dashboard
│   │
│   ├── components/
│   │   ├── dashboard/           # SummaryCard, ExpensePieChart, MonthlyBarChart, InsightCard
│   │   ├── expenses/            # InstallmentGroupCard, InstallmentForm
│   │   ├── layout/              # Sidebar
│   │   └── ui/                  # Button, Input, Card, Dialog, Select, Tabs, Skeleton...
│   │
│   ├── hooks/                   # useDashboard, useExpenses, useIncomes, usePiggys, useInstallments, useCategories
│   ├── lib/
│   │   ├── api/                 # Per-domain API functions (auth, expenses, incomes, piggys, reports...)
│   │   ├── http.ts              # Axios instance
│   │   └── utils.ts             # formatCurrency, cn()
│   ├── providers/
│   │   └── auth-provider.tsx    # AuthContext: user state, login, logout
│   ├── middleware.ts             # Route protection
│   └── types/
│       └── index.ts             # Shared TypeScript types
```

## 🏗️ Architecture

### Authentication Flow

```
User visits /dashboard
    ↓
middleware.ts checks for JWT cookie
    ↓ (no token)          ↓ (token present)
redirect /login        render dashboard

Login form → POST /api/auth/login → store token in cookie → redirect /dashboard
AuthProvider reads cookie → sets user in React context → available app-wide
```

### Data Fetching Pattern

Every dashboard page uses a dedicated custom hook:

```typescript
// hooks/use-dashboard.ts
export function useDashboard(year: number) {
  const [monthly, setMonthly] = useState<MonthlyReport | null>(null);
  const [annual, setAnnual] = useState<AnnualReport | null>(null);
  const [comparison, setComparison] = useState<MonthComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMonthlyReport(),
      getAnnualReport(year),
      getMonthComparison(),
    ]).then(([monthly, annual, comparison]) => {
      setMonthly(monthly);
      setAnnual(annual);
      setComparison(comparison);
      setIsLoading(false);
    });
  }, [year]);

  return { monthly, annual, comparison, isLoading };
}
```

This keeps pages clean — they only receive ready-to-render data and loading/error state.

### Financial Insights Engine

The dashboard generates contextual insights from report data entirely on the client, without an AI call:

```typescript
function buildInsights(monthly: MonthlyReport, comparison: MonthComparison) {
  const insights = [];

  // Expense-to-income ratio
  const pct = (monthly.totalExpenses / monthly.totalIncomes) * 100;
  const type = pct > 100 ? 'negative' : pct < 70 ? 'positive' : 'neutral';
  insights.push({ text: `You spent ${pct.toFixed(1)}% of your income this month.`, type });

  // Month-over-month trend
  if (comparison.trend === 'decrease') {
    insights.push({ text: `Expenses dropped ${pct}% vs last month.`, type: 'positive' });
  }
  // ...
}
```

## 📚 What I Learned

**Technical Skills:**
- Next.js 15 App Router: route groups, nested layouts, `loading.tsx` for automatic Suspense-like skeletons, and `middleware.ts` for server-side route protection
- Building reusable chart components with Recharts (`BarChart`, `PieChart`, custom tooltips)
- Composing accessible UI with Radix UI primitives
- Structuring a multi-page app with custom hooks as the data layer, keeping components purely presentational
- Cookie-based auth in Next.js without a backend-for-frontend layer

**Best Practices:**
- Route groups `(auth)` and `(dashboard)` to apply different layouts without affecting URL structure
- Skeleton loading states via `loading.tsx` to eliminate layout shift and improve perceived performance
- Centralizing API logic in `src/lib/api/` keeps hooks thin and functions easily testable
- Typing all API responses in `src/types/index.ts` for end-to-end type safety from API to component

## 🗺️ Roadmap

- [ ] Dark mode toggle
- [ ] Expense filters by category, date range, and amount
- [ ] Export dashboard data as CSV
- [ ] Notifications for budget threshold alerts
- [ ] Mobile-first PWA support

## 📄 License

UNLICENSED — personal project.

## 👤 Author

**Luan Neumann**

- 💼 LinkedIn: [LuanNeumannDev](https://www.linkedin.com/in/luan-henrique-neumann-dev/)
- 🐱 GitHub: [@Luan-Neumann-Dev](https://github.com/Luan-Neumann-Dev)
---

<div align="center">

⭐ Star this repository if you found it helpful!

</div>
