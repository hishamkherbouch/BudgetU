import type { SupabaseClient } from "@supabase/supabase-js";
import type { Debt, DebtPayment } from "@/lib/types";
import { ok, err, type Result } from "@/lib/result";

export async function getDebtById(
  supabase: SupabaseClient,
  id: string
): Promise<Result<Debt>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return err(error.message);
  if (!data) return err("Debt not found");
  return ok(data as Debt);
}

export async function createDebt(
  supabase: SupabaseClient,
  debt: {
    name: string;
    debt_type: Debt["debt_type"];
    principal: number;
    interest_rate: number;
    loan_length_months?: number | null;
    monthly_payment: number;
    due_day?: number | null;
  }
): Promise<Result<Debt>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: user.id,
      name: debt.name,
      debt_type: debt.debt_type,
      principal: debt.principal,
      interest_rate: debt.interest_rate,
      loan_length_months: debt.loan_length_months ?? null,
      monthly_payment: debt.monthly_payment,
      due_day: debt.due_day ?? null,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data as Debt);
}

export async function getDebts(
  supabase: SupabaseClient
): Promise<Result<Debt[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return ok((data ?? []) as Debt[]);
}

export async function updateDebt(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Pick<Debt, "name" | "principal" | "monthly_payment">>
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("debts")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  return ok(null);
}

export async function deleteDebt(
  supabase: SupabaseClient,
  id: string
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { error } = await supabase
    .from("debts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return err(error.message);
  return ok(null);
}

export async function addDebtPayment(
  supabase: SupabaseClient,
  debtId: string,
  payment: { amount: number; date: string; is_extra?: boolean; notes?: string }
): Promise<Result<DebtPayment>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data: debt, error: fetchError } = await supabase
    .from("debts")
    .select("principal")
    .eq("id", debtId)
    .eq("user_id", user.id)
    .single();

  if (fetchError) return err(fetchError.message);
  if (!debt) return err("Debt not found");

  const newPrincipal = Math.max(0, Number(debt.principal) - payment.amount);

  const { data, error } = await supabase
    .from("debt_payments")
    .insert({
      user_id: user.id,
      debt_id: debtId,
      amount: payment.amount,
      date: payment.date,
      is_extra: payment.is_extra ?? false,
      notes: payment.notes ?? null,
    })
    .select()
    .single();

  if (error) return err(error.message);

  await supabase
    .from("debts")
    .update({
      principal: newPrincipal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", debtId)
    .eq("user_id", user.id);

  return ok(data as DebtPayment);
}

export async function updateDebtPayment(
  supabase: SupabaseClient,
  paymentId: string,
  debtId: string,
  updates: { amount?: number; date?: string }
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data: payment, error: fetchError } = await supabase
    .from("debt_payments")
    .select("amount")
    .eq("id", paymentId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !payment) return err(fetchError?.message ?? "Payment not found");

  const oldAmount = Number(payment.amount);
  const newAmount = updates.amount ?? oldAmount;

  const { error: updateError } = await supabase
    .from("debt_payments")
    .update({
      ...(updates.amount !== undefined && { amount: updates.amount }),
      ...(updates.date !== undefined && { date: updates.date }),
    })
    .eq("id", paymentId)
    .eq("user_id", user.id);

  if (updateError) return err(updateError.message);

  if (updates.amount !== undefined && oldAmount !== newAmount) {
    const { data: debt } = await supabase
      .from("debts")
      .select("principal")
      .eq("id", debtId)
      .eq("user_id", user.id)
      .single();

    if (debt) {
      const diff = oldAmount - newAmount;
      const newPrincipal = Math.max(0, Number(debt.principal) + diff);
      await supabase
        .from("debts")
        .update({ principal: newPrincipal, updated_at: new Date().toISOString() })
        .eq("id", debtId)
        .eq("user_id", user.id);
    }
  }

  return ok(null);
}

export async function deleteDebtPayment(
  supabase: SupabaseClient,
  paymentId: string,
  debtId: string
): Promise<Result<null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data: payment, error: fetchError } = await supabase
    .from("debt_payments")
    .select("amount")
    .eq("id", paymentId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !payment) return err(fetchError?.message ?? "Payment not found");

  const amount = Number(payment.amount);

  const { error: deleteError } = await supabase
    .from("debt_payments")
    .delete()
    .eq("id", paymentId)
    .eq("user_id", user.id);

  if (deleteError) return err(deleteError.message);

  const { data: debt } = await supabase
    .from("debts")
    .select("principal")
    .eq("id", debtId)
    .eq("user_id", user.id)
    .single();

  if (debt) {
    const newPrincipal = Number(debt.principal) + amount;
    await supabase
      .from("debts")
      .update({ principal: newPrincipal, updated_at: new Date().toISOString() })
      .eq("id", debtId)
      .eq("user_id", user.id);
  }

  return ok(null);
}

export async function getMonthDebtPayments(
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
    .from("debt_payments")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lt("date", endDate);

  if (error) return err(error.message);

  const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  return ok(total);
}

export async function getYearToDateDebtPayments(
  supabase: SupabaseClient
): Promise<Result<number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const now = new Date();
  const startDate = `${now.getFullYear()}-01-01`;

  const { data, error } = await supabase
    .from("debt_payments")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", now.toISOString().split("T")[0]);

  if (error) return err(error.message);

  const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  return ok(total);
}

export async function getDebtPaymentsInRange(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string
): Promise<Result<number>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("debt_payments")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error) return err(error.message);

  const total = (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  return ok(total);
}

export async function getDebtPaymentsForDebt(
  supabase: SupabaseClient,
  debtId: string
): Promise<Result<DebtPayment[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const { data, error } = await supabase
    .from("debt_payments")
    .select("*")
    .eq("user_id", user.id)
    .eq("debt_id", debtId)
    .order("date", { ascending: false });

  if (error) return err(error.message);
  return ok((data ?? []) as DebtPayment[]);
}

export async function getDebtPaymentsForMonth(
  supabase: SupabaseClient,
  debtId: string,
  year: number,
  month: number
): Promise<Result<DebtPayment[]>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("Not authenticated");

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("debt_payments")
    .select("*")
    .eq("user_id", user.id)
    .eq("debt_id", debtId)
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date", { ascending: false });

  if (error) return err(error.message);
  return ok((data ?? []) as DebtPayment[]);
}
