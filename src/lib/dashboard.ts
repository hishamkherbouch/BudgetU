import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, Expense, IncomeFrequency } from "@/lib/types";
import { getProfile } from "@/lib/profiles";
import { getMonthExpenses, getExpensesInRange } from "@/lib/expenses";
import {
  getMonthSavingsContributions,
  getSavingsInRange,
} from "@/lib/savings-goals";
import {
  getMonthDebtPayments,
  getDebtPaymentsInRange,
} from "@/lib/debts";
import { getIncomeInRange } from "@/lib/income";
import { ok, err, type Result } from "@/lib/result";

export type CategoryTotal = {
  category: string;
  total: number;
  percentage: number;
};

export type PeriodOverviewData = {
  totalIncome: number;
  totalSpent: number;
  totalSaved: number;
  totalDebtPayments: number;
  topCategories: CategoryTotal[];
};

export type DashboardData = {
  profile: Profile;
  monthlyIncome: number;
  totalSpent: number;
  totalSavingsThisMonth: number;
  totalDebtPaymentsThisMonth: number;
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

  const savingsResult = await getMonthSavingsContributions(
    supabase,
    now.getFullYear(),
    now.getMonth() + 1
  );
  const totalSavingsThisMonth = savingsResult.ok ? savingsResult.value : 0;

  const debtResult = await getMonthDebtPayments(
    supabase,
    now.getFullYear(),
    now.getMonth() + 1
  );
  const totalDebtPaymentsThisMonth = debtResult.ok ? debtResult.value : 0;

  const monthlyIncome = Number(profile.monthly_income);
  const budgetRemaining =
    monthlyIncome - totalSpent - totalSavingsThisMonth - totalDebtPaymentsThisMonth;

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
    totalSavingsThisMonth,
    totalDebtPaymentsThisMonth,
    budgetRemaining,
    categoryTotals,
    expenses,
  });
}

export async function getPeriodOverviewData(
  supabase: SupabaseClient,
  months: 3 | 6 | 12
): Promise<Result<PeriodOverviewData>> {
  const now = new Date();
  const endDate = now.toISOString().split("T")[0];
  const start = new Date(now);
  start.setMonth(start.getMonth() - months);
  const startDate = start.toISOString().split("T")[0];

  const [expensesResult, savingsResult, debtResult, incomeResult] = await Promise.all([
    getExpensesInRange(supabase, startDate, endDate),
    getSavingsInRange(supabase, startDate, endDate),
    getDebtPaymentsInRange(supabase, startDate, endDate),
    getIncomeInRange(supabase, startDate, endDate),
  ]);

  const expenses = expensesResult.ok ? expensesResult.value : [];
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalSaved = savingsResult.ok ? savingsResult.value : 0;
  const totalDebtPayments = debtResult.ok ? debtResult.value : 0;
  const totalIncome = incomeResult.ok ? incomeResult.value : 0;

  const categoryMap = new Map<string, number>();
  for (const expense of expenses) {
    const current = categoryMap.get(expense.category) ?? 0;
    categoryMap.set(expense.category, current + Number(expense.amount));
  }

  const topCategories: CategoryTotal[] = Array.from(categoryMap.entries())
    .map(([category, total]) => ({
      category,
      total,
      percentage: totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  return ok({ totalIncome, totalSpent, totalSaved, totalDebtPayments, topCategories });
}
