export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profiles";
import { getRecurringTransactions, generateOccurrences } from "@/lib/recurring";
import { parseMonth, formatMonthLabel } from "@/lib/month";
import MonthSelector from "@/components/dashboard/MonthSelector";
import RecurringForm from "@/components/dashboard/RecurringForm";
import RecurringList from "@/components/dashboard/RecurringList";
import { RECURRING_FREQUENCIES } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default async function RecurringPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { year, month } = parseMonth(params);

  const supabase = await createClient();
  const profileResult = await getProfile(supabase);

  if (!profileResult.ok || profileResult.value.monthly_income <= 0) {
    redirect("/onboarding");
  }

  const result = await getRecurringTransactions(supabase);
  const transactions = result.ok ? result.value : [];

  // Compute this month's preview
  const monthPreview = transactions.map((t) => {
    const occurrences = generateOccurrences(t.frequency, t.start_date, year, month);
    return {
      ...t,
      occurrenceCount: occurrences.length,
      monthTotal: occurrences.length * Number(t.amount),
    };
  });

  const totalRecurringIncome = monthPreview
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.monthTotal, 0);

  const totalRecurringExpense = monthPreview
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.monthTotal, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-budgetu-heading">
            Recurring Transactions
          </h1>
          <p className="text-budgetu-muted text-sm mt-1">
            Set up automatic income and expenses that repeat on a schedule
          </p>
        </div>
        <MonthSelector year={year} month={month} />
      </div>

      {/* Monthly preview */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-budgetu-heading">
              {formatMonthLabel(year, month)} Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-budgetu-muted">Recurring Income</p>
                <p className="text-2xl font-bold text-budgetu-positive">
                  +${totalRecurringIncome.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-budgetu-muted">Recurring Expenses</p>
                <p className="text-2xl font-bold text-budgetu-negative">
                  -${totalRecurringExpense.toFixed(2)}
                </p>
              </div>
            </div>

            {monthPreview.filter((t) => t.occurrenceCount > 0).length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-budgetu-heading">
                  This month&apos;s occurrences:
                </p>
                {monthPreview
                  .filter((t) => t.occurrenceCount > 0)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between text-sm py-1"
                    >
                      <span className="text-budgetu-body">
                        {t.description || t.category || t.source || "Recurring"}{" "}
                        <span className="text-budgetu-muted">
                          ({RECURRING_FREQUENCIES[t.frequency]}, {t.occurrenceCount}x)
                        </span>
                      </span>
                      <span
                        className={`font-medium ${
                          t.type === "income"
                            ? "text-budgetu-positive"
                            : "text-budgetu-negative"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}$
                        {t.monthTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <RecurringForm />
      <RecurringList transactions={transactions} />
    </div>
  );
}
