export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import { getSavingsGoals } from "@/lib/savings-goals";
import { getDebts } from "@/lib/debts";
import { computeInsights } from "@/lib/insights";
import { parseMonth, formatMonthLabel } from "@/lib/month";
import { getCategoryBudgets } from "@/lib/category-budgets";
import MonthSelector from "@/components/dashboard/MonthSelector";
import SummaryCards from "@/components/dashboard/SummaryCards";
import HeroBudgetCard from "@/components/dashboard/HeroBudgetCard";
import SpendingTrendChart from "@/components/dashboard/SpendingTrendChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import SavingsGoals from "@/components/dashboard/SavingsGoals";
import Debts from "@/components/dashboard/Debts";
import SpendingInsights from "@/components/dashboard/SpendingInsights";
import PeriodOverview from "@/components/dashboard/YearToDateOverview";
import BudgetAlerts from "@/components/dashboard/BudgetAlerts";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { year, month } = parseMonth(params);

  const supabase = await createClient();
  const result = await getDashboardData(supabase, year, month);

  if (!result.ok || result.value.profile.monthly_income <= 0) {
    redirect("/onboarding");
  }

  const { budget, categoryTotals, profile } = result.value;

  const goalsResult = await getSavingsGoals(supabase);
  const goals = goalsResult.ok ? goalsResult.value : [];

  const debtsResult = await getDebts(supabase);
  const debts = debtsResult.ok ? debtsResult.value : [];

  const budgetsResult = await getCategoryBudgets(supabase);
  const categoryBudgets = budgetsResult.ok ? budgetsResult.value : [];

  const insights = computeInsights(
    budget.incomeTotal,
    budget.expenseTotal,
    categoryTotals,
    goals
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-budgetu-heading">Dashboard</h1>
          <p className="text-budgetu-muted text-sm mt-1">
            {formatMonthLabel(year, month)}
          </p>
        </div>
        <MonthSelector year={year} month={month} />
      </div>

      {/* Bento: Hero "Available to Spend" */}
      <HeroBudgetCard budget={budget} />

      {/* Bento: Summary row */}
      <SummaryCards budget={budget} />

      {/* Bento: 3-month trend + Period overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border dark:border-slate-700 bg-card dark:bg-slate-900/70 dark:backdrop-blur-md p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-budgetu-heading mb-4">
            3-Month Spending Trend
          </h3>
          <SpendingTrendChart />
        </div>
        <PeriodOverview />
      </div>

      {/* Budget overspend alerts */}
      <BudgetAlerts categoryTotals={categoryTotals} categoryBudgets={categoryBudgets} />

      {/* Bento: Category, Savings, Debt */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryBreakdown categoryTotals={categoryTotals} initialBudgets={categoryBudgets} />
        <SavingsGoals goals={goals} generalSavings={Number(profile.general_savings_balance ?? 0)} />
        <Debts debts={debts} />
      </div>

      <SpendingInsights insights={insights} />
    </div>
  );
}
