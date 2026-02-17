export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import { parseMonth, formatMonthLabel } from "@/lib/month";
import MonthSelector from "@/components/dashboard/MonthSelector";
import ExpenseForm from "@/components/dashboard/ExpenseForm";
import ExpenseList from "@/components/dashboard/ExpenseList";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { year, month } = parseMonth(params);

  const supabase = await createClient();
  const result = await getDashboardData(supabase, year, month);

  if (!result.ok || result.value.profile.monthly_income <= 0) {
    redirect("/onboarding");
  }

  const { expenses } = result.value;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-budgetu-heading">Expenses</h1>
          <p className="text-budgetu-muted text-sm mt-1">
            Add and manage your spending for {formatMonthLabel(year, month)}
          </p>
        </div>
        <MonthSelector year={year} month={month} />
      </div>

      <ExpenseForm />
      <ExpenseList expenses={expenses} />
    </div>
  );
}
