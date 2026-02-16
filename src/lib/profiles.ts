import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, IncomeFrequency } from "@/lib/types";
import { ok, err, type Result } from "@/lib/result";

export async function getProfile(
  supabase: SupabaseClient
): Promise<Result<Profile>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return err(error.message);
  return ok(data as Profile);
}

export async function updateMonthlyIncome(
  supabase: SupabaseClient,
  amount: number
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ monthly_income: amount, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return err(error.message);
  return ok(null);
}

export async function updateIncomeSettings(
  supabase: SupabaseClient,
  settings: { monthly_income: number; income_frequency: IncomeFrequency }
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      monthly_income: settings.monthly_income,
      income_frequency: settings.income_frequency,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return err(error.message);
  return ok(null);
}

export async function updateGeneralSavings(
  supabase: SupabaseClient,
  amount: number
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  // Fetch current balance first
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("general_savings_balance")
    .eq("id", user.id)
    .single();

  if (fetchError) return err(fetchError.message);

  const current = Number(profile.general_savings_balance ?? 0);
  const newBalance = current + amount;

  const { error } = await supabase
    .from("profiles")
    .update({
      general_savings_balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return err(error.message);
  return ok(null);
}

export async function setGeneralSavings(
  supabase: SupabaseClient,
  amount: number
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      general_savings_balance: amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return err(error.message);
  return ok(null);
}
