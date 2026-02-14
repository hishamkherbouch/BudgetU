import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, Expense } from "@/lib/types";
import { getProfile } from "@/lib/profiles";
import { getMonthExpenses } from "@/lib/expenses";
import { ok, err, type Result } from "@/lib/result";

export type CategoryTotal = {
  category: string;
  total: number;
  percentage: number;
};

export type DashboardData = {
  profile: Profile;
  monthlyIncome: number;
  totalSpent: number;
  budgetRemaining: number;
  categoryTotals: CategoryTotal[];
  expenses: Expense[];
};

export async function getDashboardData(
  supabase: SupabaseClient
): Promise<Result<DashboardData>> {
  const profileResult = await getProfile(supabase);
  if (!profileResult.ok) return err(profileResult.error);

  const profile = profileResult.value;
  const now = new Date();
  const expensesResult = await getMonthExpenses(
    supabase,
    now.getFullYear(),
    now.getMonth() + 1
  );

  const expenses = expensesResult.ok ? expensesResult.value : [];

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const monthlyIncome = Number(profile.monthly_income);
  const budgetRemaining = monthlyIncome - totalSpent;

  // Compute category totals
  const categoryMap = new Map<string, number>();
  for (const expense of expenses) {
    const current = categoryMap.get(expense.category) ?? 0;
    categoryMap.set(expense.category, current + Number(expense.amount));
  }

  const categoryTotals: CategoryTotal[] = Array.from(categoryMap.entries())
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return ok({
    profile,
    monthlyIncome,
    totalSpent,
    budgetRemaining,
    categoryTotals,
    expenses,
  });
}
