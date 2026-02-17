import type { SupabaseClient } from "@supabase/supabase-js";
import type { IncomeEntry } from "@/lib/types";
import { ok, err, type Result } from "@/lib/result";

export async function addIncomeEntry(
  supabase: SupabaseClient,
  entry: {
    amount: number;
    source: string;
    description: string;
    date: string;
  }
): Promise<Result<IncomeEntry>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("income_entries")
    .insert({
      user_id: user.id,
      amount: entry.amount,
      source: entry.source,
      description: entry.description || null,
      date: entry.date,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data as IncomeEntry);
}

export async function getMonthIncomeEntries(
  supabase: SupabaseClient,
  year: number,
  month: number
): Promise<Result<IncomeEntry[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("income_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date", { ascending: false });

  if (error) return err(error.message);
  return ok((data ?? []) as IncomeEntry[]);
}

export async function getIncomeInRange(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<Result<number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("income_entries")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) return err(error.message);

  const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  return ok(total);
}

export async function updateIncomeEntry(
  supabase: SupabaseClient,
  id: string,
  updates: { amount?: number; source?: string; description?: string; date?: string }
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("income_entries")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  return ok(null);
}

export async function deleteIncomeEntry(
  supabase: SupabaseClient,
  id: string
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("income_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  return ok(null);
}
