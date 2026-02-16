import type { SupabaseClient } from "@supabase/supabase-js";
import type { SavingsGoal } from "@/lib/types";
import { ok, err, type Result } from "@/lib/result";

export async function createSavingsGoal(
  supabase: SupabaseClient,
  goal: { name: string; target_amount: number; is_emergency_fund: boolean }
): Promise<Result<SavingsGoal>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("savings_goals")
    .insert({
      user_id: user.id,
      name: goal.name,
      target_amount: goal.target_amount,
      is_emergency_fund: goal.is_emergency_fund,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data as SavingsGoal);
}

export async function getSavingsGoals(
  supabase: SupabaseClient
): Promise<Result<SavingsGoal[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return err(error.message);
  return ok((data ?? []) as SavingsGoal[]);
}

export async function updateSavingsProgress(
  supabase: SupabaseClient,
  goalId: string,
  addAmount: number
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  // Fetch current amount first
  const { data: goal, error: fetchError } = await supabase
    .from("savings_goals")
    .select("current_amount")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchError) return err(fetchError.message);

  const newAmount = (goal.current_amount ?? 0) + addAmount;
  const today = new Date().toISOString().split("T")[0];

  // Record contribution so it deducts from budget
  const { error: contributionError } = await supabase
    .from("savings_contributions")
    .insert({
      user_id: user.id,
      goal_id: goalId,
      amount: addAmount,
      date: today,
    });

  if (contributionError) return err(contributionError.message);

  const { error } = await supabase
    .from("savings_goals")
    .update({
      current_amount: newAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  return ok(null);
}

export async function getMonthSavingsContributions(
  supabase: SupabaseClient,
  year: number,
  month: number
): Promise<Result<number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("savings_contributions")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lt("date", endDate);

  if (error) return err(error.message);

  const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  return ok(total);
}

export async function getYearToDateSavings(
  supabase: SupabaseClient
): Promise<Result<number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const now = new Date();
  const startDate = `${now.getFullYear()}-01-01`;

  const { data, error } = await supabase
    .from("savings_contributions")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", now.toISOString().split("T")[0]);

  if (error) return err(error.message);

  const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  return ok(total);
}

export async function getSavingsInRange(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<Result<number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("savings_contributions")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) return err(error.message);

  const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  return ok(total);
}

export async function deleteSavingsGoal(
  supabase: SupabaseClient,
  id: string
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  return ok(null);
}
