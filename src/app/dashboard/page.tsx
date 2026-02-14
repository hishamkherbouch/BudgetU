import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import { getSavingsGoals } from "@/lib/savings-goals";
import { computeInsights } from "@/lib/insights";
import SummaryCards from "@/components/dashboard/SummaryCards";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import SavingsGoals from "@/components/dashboard/SavingsGoals";
import SpendingInsights from "@/components/dashboard/SpendingInsights";
import ExpenseForm from "@/components/dashboard/ExpenseForm";
import ExpenseList from "@/components/dashboard/ExpenseList";

export default async function DashboardPage() {
  const supabase = await createClient();
  const result = await getDashboardData(supabase);

  if (!result.ok || result.value.profile.monthly_income <= 0) {
    redirect("/onboarding");
  }

  const {
    monthlyIncome,
    totalSpent,
    budgetRemaining,
    categoryTotals,
    expenses,
  } = result.value;

  const goalsResult = await getSavingsGoals(supabase);
  const goals = goalsResult.ok ? goalsResult.value : [];

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
        budgetRemaining={budgetRemaining}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryBreakdown categoryTotals={categoryTotals} />
        <SavingsGoals goals={goals} />
      </div>

      <SpendingInsights insights={insights} />

      <ExpenseForm />
      <ExpenseList expenses={expenses} />
    </div>
  );
}
