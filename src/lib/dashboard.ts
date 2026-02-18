import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, Expense } from "@/lib/types";
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
import { getMonthIncomeTotal, getIncomeInRange } from "@/lib/income";
import { getMonthRecurringTotals } from "@/lib/recurring";
import { ok, err, type Result } from "@/lib/result";

export type CategoryTotal = {
  category: string;
  total: number;
  percentage: number;
};

export type BudgetSummary = {
  incomeTotal: number;
  expenseTotal: number;
  savingsTotal: number;
  debtPaidTotal: number;
  budgetRemaining: number;
  savingsRate: number;
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
  budget: BudgetSummary;
  categoryTotals: CategoryTotal[];
  expenses: Expense[];
};

/**
 * Central budget calculation function.
 *
 * For the selected month:
 *   income_total      = sum of income_entries (falls back to profile.monthly_income if no entries)
 *   expense_total     = sum of expenses
 *   savings_total     = sum of savings contributions
 *   debt_paid_total   = sum of debt payments
 *   budget_remaining  = income_total - (expense_total + savings_total + debt_paid_total)
 *   savings_rate      = savings_total / income_total (0 if no income)
 */
export function computeBudgetSummary(
  incomeTotal: number,
  expenseTotal: number,
  savingsTotal: number,
  debtPaidTotal: number
): BudgetSummary {
  const budgetRemaining = incomeTotal - (expenseTotal + savingsTotal + debtPaidTotal);
  const savingsRate = incomeTotal > 0 ? savingsTotal / incomeTotal : 0;

  return {
    incomeTotal,
    expenseTotal,
    savingsTotal,
    debtPaidTotal,
    budgetRemaining,
    savingsRate,
  };
}

export async function getDashboardData(
  supabase: SupabaseClient,
  year?: number,
  month?: number
): Promise<Result<DashboardData>> {
  const profileResult = await getProfile(supabase);
  if (!profileResult.ok) return err(profileResult.error);

  const profile = profileResult.value;
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;

  // Fetch all data for the month in parallel
  const [expensesResult, savingsResult, debtResult, incomeResult, recurringResult] =
    await Promise.all([
      getMonthExpenses(supabase, y, m),
      getMonthSavingsContributions(supabase, y, m),
      getMonthDebtPayments(supabase, y, m),
      getMonthIncomeTotal(supabase, y, m),
      getMonthRecurringTotals(supabase, y, m),
    ]);

  const expenses = expensesResult.ok ? expensesResult.value : [];
  const expenseTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const savingsTotal = savingsResult.ok ? savingsResult.value : 0;
  const debtPaidTotal = debtResult.ok ? debtResult.value : 0;

  const recurringIncome = recurringResult.ok ? recurringResult.value.recurringIncome : 0;
  const recurringExpense = recurringResult.ok ? recurringResult.value.recurringExpense : 0;

  // Use actual income entries if available, fall back to profile.monthly_income
  // Add recurring income on top
  const incomeFromEntries = incomeResult.ok ? incomeResult.value : 0;
  const baseIncome = incomeFromEntries > 0
    ? incomeFromEntries
    : Number(profile.monthly_income);
  const incomeTotal = baseIncome + recurringIncome;

  const budget = computeBudgetSummary(
    incomeTotal,
    expenseTotal + recurringExpense,
    savingsTotal,
    debtPaidTotal
  );

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
      percentage: expenseTotal > 0 ? Math.round((total / expenseTotal) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return ok({
    profile,
    budget,
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
