import type { SupabaseClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import { ok, err, type Result } from "@/lib/result";

type ExportData = {
  income: Record<string, unknown>[];
  expenses: Record<string, unknown>[];
  savings_contributions: Record<string, unknown>[];
  debts: Record<string, unknown>[];
  debt_payments: Record<string, unknown>[];
};

async function fetchAllUserData(
  supabase: SupabaseClient
): Promise<Result<ExportData>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const [incomeRes, expensesRes, contributionsRes, debtsRes, paymentsRes] =
    await Promise.all([
      supabase
        .from("income_entries")
        .select("amount, source, description, date, created_at")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      supabase
        .from("expenses")
        .select("amount, category, description, date, created_at")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      supabase
        .from("savings_contributions")
        .select("amount, date, goal_id, created_at")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      supabase
        .from("debts")
        .select("name, debt_type, principal, interest_rate, monthly_payment, due_day, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("debt_payments")
        .select("amount, date, debt_id, is_extra, notes, created_at")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
    ]);

  if (incomeRes.error) return err(incomeRes.error.message);
  if (expensesRes.error) return err(expensesRes.error.message);
  if (contributionsRes.error) return err(contributionsRes.error.message);
  if (debtsRes.error) return err(debtsRes.error.message);
  if (paymentsRes.error) return err(paymentsRes.error.message);

  return ok({
    income: incomeRes.data ?? [],
    expenses: expensesRes.data ?? [],
    savings_contributions: contributionsRes.data ?? [],
    debts: debtsRes.data ?? [],
    debt_payments: paymentsRes.data ?? [],
  });
}

function toCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  return Papa.unparse(data);
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportAllData(
  supabase: SupabaseClient
): Promise<Result<null>> {
  const result = await fetchAllUserData(supabase);
  if (!result.ok) return err(result.error);

  const data = result.value;
  const timestamp = new Date().toISOString().split("T")[0];

  // Download each as separate CSV
  const sheets: [string, Record<string, unknown>[]][] = [
    ["income", data.income],
    ["expenses", data.expenses],
    ["savings_contributions", data.savings_contributions],
    ["debts", data.debts],
    ["debt_payments", data.debt_payments],
  ];

  for (const [name, rows] of sheets) {
    if (rows.length > 0) {
      const csv = toCsv(rows);
      downloadFile(csv, `budgetu_${name}_${timestamp}.csv`, "text/csv");
    }
  }

  return ok(null);
}
