export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import { getSavingsGoals } from "@/lib/savings-goals";
import { getDebts } from "@/lib/debts";
import { computeInsights } from "@/lib/insights";
import { parseMonth, formatMonthLabel } from "@/lib/month";
import MonthSelector from "@/components/dashboard/MonthSelector";
import SummaryCards from "@/components/dashboard/SummaryCards";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import SavingsGoals from "@/components/dashboard/SavingsGoals";
import Debts from "@/components/dashboard/Debts";
import SpendingInsights from "@/components/dashboard/SpendingInsights";
import PeriodOverview from "@/components/dashboard/YearToDateOverview";

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

  const {
    monthlyIncome,
    totalSpent,
    totalSavingsThisMonth,
    totalDebtPaymentsThisMonth,
    budgetRemaining,
    categoryTotals,
    profile,
  } = result.value;

  const goalsResult = await getSavingsGoals(supabase);
  const goals = goalsResult.ok ? goalsResult.value : [];

  const debtsResult = await getDebts(supabase);
  const debts = debtsResult.ok ? debtsResult.value : [];

  const insights = computeInsights(
    monthlyIncome,
    totalSpent,
    categoryTotals,
    goals
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-budgetu-heading">Dashboard</h1>
          <p className="text-budgetu-muted text-sm mt-1">
            {formatMonthLabel(year, month)}
          </p>
        </div>
        <MonthSelector year={year} month={month} />
      </div>

      <SummaryCards
        monthlyIncome={monthlyIncome}
        totalSpent={totalSpent}
        totalSavingsThisMonth={totalSavingsThisMonth}
        totalDebtPaymentsThisMonth={totalDebtPaymentsThisMonth}
        budgetRemaining={budgetRemaining}
        incomeFrequency={profile.income_frequency}
      />

      <PeriodOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryBreakdown categoryTotals={categoryTotals} />
        <SavingsGoals goals={goals} generalSavings={Number(profile.general_savings_balance ?? 0)} />
        <Debts debts={debts} />
      </div>

      <SpendingInsights insights={insights} />
    </div>
  );
}
