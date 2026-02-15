export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import { getSavingsGoals } from "@/lib/savings-goals";
import { getDebts } from "@/lib/debts";
import { computeInsights } from "@/lib/insights";
import SummaryCards from "@/components/dashboard/SummaryCards";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import SavingsGoals from "@/components/dashboard/SavingsGoals";
import Debts from "@/components/dashboard/Debts";
import SpendingInsights from "@/components/dashboard/SpendingInsights";
import YearToDateOverview from "@/components/dashboard/YearToDateOverview";

export default async function DashboardPage() {
  const supabase = await createClient();
  const result = await getDashboardData(supabase);

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
    yearToDate,
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

  const now = new Date();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-budgetu-heading">Dashboard</h1>
        <p className="text-budgetu-muted text-sm mt-1">
          {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      <SummaryCards
        monthlyIncome={monthlyIncome}
        totalSpent={totalSpent}
        totalSavingsThisMonth={totalSavingsThisMonth}
        totalDebtPaymentsThisMonth={totalDebtPaymentsThisMonth}
        budgetRemaining={budgetRemaining}
      />

      <YearToDateOverview data={yearToDate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CategoryBreakdown categoryTotals={categoryTotals} />
        <SavingsGoals goals={goals} />
        <Debts debts={debts} />
      </div>

      <SpendingInsights insights={insights} />
    </div>
  );
}
