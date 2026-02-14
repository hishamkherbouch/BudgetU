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
