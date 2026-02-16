import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense } from "@/lib/types";
import { ok, err, type Result } from "@/lib/result";

export async function addExpense(
  supabase: SupabaseClient,
  expense: {
    amount: number;
    category: string;
    description: string;
    date: string;
  }
): Promise<Result<Expense>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      amount: expense.amount,
      category: expense.category,
      description: expense.description || null,
      date: expense.date,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data as Expense);
}

export async function getMonthExpenses(
  supabase: SupabaseClient,
  year: number,
  month: number
): Promise<Result<Expense[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date", { ascending: false });

  if (error) return err(error.message);
  return ok((data ?? []) as Expense[]);
}

export async function getYearToDateExpenses(
  supabase: SupabaseClient
): Promise<Result<number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const now = new Date();
  const startDate = `${now.getFullYear()}-01-01`;

  const { data, error } = await supabase
    .from("expenses")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", now.toISOString().split("T")[0]);

  if (error) return err(error.message);

  const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  return ok(total);
}

export async function getExpensesInRange(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<Result<Expense[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) return err(error.message);
  return ok((data ?? []) as Expense[]);
}

export async function deleteExpense(
  supabase: SupabaseClient,
  id: string
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  return ok(null);
}
