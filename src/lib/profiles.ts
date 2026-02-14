import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
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
