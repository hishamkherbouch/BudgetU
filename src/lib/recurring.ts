import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecurringTransaction, RecurringFrequency } from "@/lib/types";
import { ok, err, type Result } from "@/lib/result";

export async function addRecurringTransaction(
  supabase: SupabaseClient,
  entry: {
    type: "income" | "expense";
    amount: number;
    category?: string | null;
    category_id?: string | null;
    source?: string | null;
    description?: string | null;
    frequency: RecurringFrequency;
    start_date: string;
  }
): Promise<Result<RecurringTransaction>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("recurring_transactions")
    .insert({
      user_id: user.id,
      type: entry.type,
      amount: entry.amount,
      category: entry.category ?? null,
      category_id: entry.category_id ?? null,
      source: entry.source ?? null,
      description: entry.description ?? null,
      frequency: entry.frequency,
      start_date: entry.start_date,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data as RecurringTransaction);
}

export async function getRecurringTransactions(
  supabase: SupabaseClient
): Promise<Result<RecurringTransaction[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok((data ?? []) as RecurringTransaction[]);
}

export async function updateRecurringTransaction(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<
    Pick<
      RecurringTransaction,
      "amount" | "category" | "category_id" | "source" | "description" | "frequency" | "start_date" | "is_active"
    >
  >
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("recurring_transactions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  return ok(null);
}

export async function deleteRecurringTransaction(
  supabase: SupabaseClient,
  id: string
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  return ok(null);
}

/**
 * Generate occurrence dates for a recurring transaction within a given month.
 * Returns an array of date strings (YYYY-MM-DD) when the transaction occurs.
 */
export function generateOccurrences(
  frequency: RecurringFrequency,
  startDate: string,
  year: number,
  month: number
): string[] {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0); // last day of month
  const start = new Date(startDate + "T00:00:00");

  if (start > monthEnd) return [];

  const dates: string[] = [];

  if (frequency === "monthly") {
    // Use the start_date's day-of-month, clamped to the month's last day
    const day = Math.min(start.getDate(), monthEnd.getDate());
    const occurrence = new Date(year, month - 1, day);
    if (occurrence >= start && occurrence >= monthStart && occurrence <= monthEnd) {
      dates.push(formatDate(occurrence));
    }
  } else {
    // weekly or biweekly: iterate from start_date forward
    const intervalDays = frequency === "weekly" ? 7 : 14;
    const cursor = new Date(start);

    // Fast-forward cursor to be at or after monthStart
    if (cursor < monthStart) {
      const daysBetween = Math.floor(
        (monthStart.getTime() - cursor.getTime()) / (1000 * 60 * 60 * 24)
      );
      const intervals = Math.floor(daysBetween / intervalDays);
      cursor.setDate(cursor.getDate() + intervals * intervalDays);
    }

    // Generate dates within the month
    while (cursor <= monthEnd) {
      if (cursor >= monthStart && cursor >= start) {
        dates.push(formatDate(cursor));
      }
      cursor.setDate(cursor.getDate() + intervalDays);
    }
  }

  return dates;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Get the total recurring income and expense amounts for a given month.
 * This computes occurrences for all active recurring transactions.
 */
export async function getMonthRecurringTotals(
  supabase: SupabaseClient,
  year: number,
  month: number
): Promise<Result<{ recurringIncome: number; recurringExpense: number }>> {
  const result = await getRecurringTransactions(supabase);
  if (!result.ok) return err(result.error);

  let recurringIncome = 0;
  let recurringExpense = 0;

  for (const rule of result.value) {
    const occurrences = generateOccurrences(rule.frequency, rule.start_date, year, month);
    const total = occurrences.length * Number(rule.amount);

    if (rule.type === "income") {
      recurringIncome += total;
    } else {
      recurringExpense += total;
    }
  }

  return ok({ recurringIncome, recurringExpense });
}
