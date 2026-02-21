export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import { getSavingsGoals } from "@/lib/savings-goals";
import { getDebts } from "@/lib/debts";
import { parseMonth } from "@/lib/month";
import { computeEducationPersonalization } from "@/lib/education-personalization";
import EducationCards from "@/components/dashboard/EducationCards";

export const metadata: Metadata = {
  title: "Financial literacy | BudgetU",
  description:
    "A crash course in financial literacy for college students: Roth IRA, 401k, high-yield savings, investing, and emergency funds.",
};

export default async function EducationPage() {
  const supabase = await createClient();
  const { year, month } = parseMonth({});

  const [dashResult, goalsResult, debtsResult] = await Promise.all([
    getDashboardData(supabase, year, month),
    getSavingsGoals(supabase),
    getDebts(supabase),
  ]);

  // Build personalization if we have enough data; otherwise pass null for generic mode
  let personalization = null;
  if (dashResult.ok) {
    const { budget, profile } = dashResult.value;
    const goals = goalsResult.ok ? goalsResult.value : [];
    const debts = debtsResult.ok ? debtsResult.value : [];

    // Total savings = general balance + sum of all goal current amounts
    const goalSavings = goals.reduce((sum, g) => sum + g.current_amount, 0);
    const totalSavings = Number(profile.general_savings_balance ?? 0) + goalSavings;

    personalization = computeEducationPersonalization({
      monthlyIncome: budget.incomeTotal || profile.monthly_income,
      monthlyExpenses: budget.expenseTotal,
      totalSavings,
      goals,
      debts,
    });
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-budgetu-heading">
          Financial literacy crash course
        </h1>
        <p className="text-budgetu-body mt-1 max-w-2xl">
          {personalization
            ? "Personalized recommendations based on your financial snapshot. Click a card to open the full guide and see how it applies to you."
            : "Click a card to open the full guide. Each topic is written for students—digestible but thorough."}
        </p>
      </div>

      <EducationCards personalization={personalization} />

      <p className="text-budgetu-muted text-sm">
        This is educational content, not professional financial advice. Consider
        talking to a financial advisor or doing more research before making major
        financial decisions.
      </p>
    </div>
  );
}
