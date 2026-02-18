import type { SupabaseClient } from "@supabase/supabase-js";
import { ok, err, type Result } from "@/lib/result";

export type DetectedSubscription = {
  merchantKey: string;
  displayName: string;
  avgAmount: number;
  monthCount: number;
  recentDate: string;
  status?: "ignored" | "canceled";
};

function normalizeMerchant(description: string): string {
  return description.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Detect subscriptions by finding merchants that appear in 3+ distinct months.
 * "Ignored" subscriptions are filtered out; "canceled" ones are included with their status.
 */
export async function detectSubscriptions(
  supabase: SupabaseClient
): Promise<Result<DetectedSubscription[]>> {
  const { data: expenseData, error: expError } = await supabase
    .from("expenses")
    .select("description, amount, date")
    .not("description", "is", null)
    .order("date", { ascending: false });

  if (expError) return err(expError.message);

  const expenses = (expenseData ?? []) as Array<{
    description: string;
    amount: number;
    date: string;
  }>;

  // Group by normalized merchant key
  const merchantMap = new Map<
    string,
    { displayName: string; amounts: number[]; months: Set<string>; recentDate: string }
  >();

  for (const exp of expenses) {
    if (!exp.description) continue;
    const key = normalizeMerchant(exp.description);
    const monthKey = exp.date.slice(0, 7); // "YYYY-MM"

    if (!merchantMap.has(key)) {
      merchantMap.set(key, {
        displayName: exp.description,
        amounts: [],
        months: new Set(),
        recentDate: exp.date,
      });
    }

    const entry = merchantMap.get(key)!;
    entry.amounts.push(Number(exp.amount));
    entry.months.add(monthKey);
    // Use the most recent display name for a cleaner label
    if (exp.date > entry.recentDate) {
      entry.recentDate = exp.date;
      entry.displayName = exp.description;
    }
  }

  // Candidate = same merchant in 3+ distinct months
  const detected: DetectedSubscription[] = [];
  for (const [key, entry] of merchantMap) {
    if (entry.months.size >= 3) {
      const avgAmount =
        entry.amounts.reduce((a, b) => a + b, 0) / entry.amounts.length;
      detected.push({
        merchantKey: key,
        displayName: entry.displayName,
        avgAmount,
        monthCount: entry.months.size,
        recentDate: entry.recentDate,
      });
    }
  }

  // Fetch overrides
  const { data: overrideData, error: overrideError } = await supabase
    .from("subscription_overrides")
    .select("merchant_key, status");

  if (overrideError) return err(overrideError.message);

  const overrides = new Map<string, "ignored" | "canceled">(
    (overrideData ?? []).map(
      (r: { merchant_key: string; status: "ignored" | "canceled" }) => [
        r.merchant_key,
        r.status,
      ]
    )
  );

  // Merge overrides and filter out ignored ones
  const merged = detected
    .map((s) => ({ ...s, status: overrides.get(s.merchantKey) }))
    .filter((s) => s.status !== "ignored")
    .sort((a, b) => b.avgAmount - a.avgAmount);

  return ok(merged);
}

/** Mark a subscription as ignored (hidden) or canceled (still visible with badge). */
export async function setSubscriptionStatus(
  supabase: SupabaseClient,
  merchantKey: string,
  status: "ignored" | "canceled"
): Promise<Result<null>> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return err("Not authenticated");

  const { error } = await supabase.from("subscription_overrides").upsert(
    { user_id: userData.user.id, merchant_key: merchantKey, status },
    { onConflict: "user_id,merchant_key" }
  );

  if (error) return err(error.message);
  return ok(null);
}

/** Remove an override, restoring a subscription to active status. */
export async function removeSubscriptionOverride(
  supabase: SupabaseClient,
  merchantKey: string
): Promise<Result<null>> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return err("Not authenticated");

  const { error } = await supabase
    .from("subscription_overrides")
    .delete()
    .eq("user_id", userData.user.id)
    .eq("merchant_key", merchantKey);

  if (error) return err(error.message);
  return ok(null);
}
