import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, Expense } from "@/lib/types";
import { getProfile } from "@/lib/profiles";
import { getMonthExpenses, getYearToDateExpenses } from "@/lib/expenses";
import {
  getMonthSavingsContributions,
  getYearToDateSavings,
} from "@/lib/savings-goals";
import {
  getMonthDebtPayments,
  getYearToDateDebtPayments,
} from "@/lib/debts";
import { ok, err, type Result } from "@/lib/result";

export type CategoryTotal = {
  category: string;
  total: number;
  percentage: number;
};

export type YearToDateData = {
  ytdIncome: number;
  ytdExpenses: number;
  ytdSavings: number;
  ytdDebtPayments: number;
  ytdRemaining: number;
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
  yearToDate: YearToDateData;
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

  // Year-to-date data
  const ytdExpensesResult = await getYearToDateExpenses(supabase);
  const ytdSavingsResult = await getYearToDateSavings(supabase);
  const ytdDebtResult = await getYearToDateDebtPayments(supabase);
  const ytdExpenses = ytdExpensesResult.ok ? ytdExpensesResult.value : 0;
  const ytdSavings = ytdSavingsResult.ok ? ytdSavingsResult.value : 0;
  const ytdDebtPayments = ytdDebtResult.ok ? ytdDebtResult.value : 0;
  const monthsElapsed = now.getMonth() + 1;
  const ytdIncome = monthlyIncome * monthsElapsed;
  const ytdRemaining =
    ytdIncome - ytdExpenses - ytdSavings - ytdDebtPayments;

  return ok({
    profile,
    monthlyIncome,
    totalSpent,
    totalSavingsThisMonth,
    totalDebtPaymentsThisMonth,
    budgetRemaining,
    categoryTotals,
    expenses,
    yearToDate: {
      ytdIncome,
      ytdExpenses,
      ytdSavings,
      ytdDebtPayments,
      ytdRemaining,
    },
  });
}
