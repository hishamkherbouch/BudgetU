export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import { getRecurringTransactions, generateOccurrences } from "@/lib/recurring";
import { detectSubscriptions } from "@/lib/subscriptions";
import { parseMonth, formatMonthLabel } from "@/lib/month";
import { RECURRING_FREQUENCIES } from "@/lib/types";
import type { RecurringTransaction } from "@/lib/types";
import MonthSelector from "@/components/dashboard/MonthSelector";
import ExpenseForm from "@/components/dashboard/ExpenseForm";
import ExpenseList from "@/components/dashboard/ExpenseList";
import RecurringForm from "@/components/dashboard/RecurringForm";
import RecurringList from "@/components/dashboard/RecurringList";
import SubscriptionList from "@/components/dashboard/SubscriptionList";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { year, month } = parseMonth(params);
  const tab = typeof params.tab === "string" ? params.tab : "expenses";
  const monthStr = typeof params.month === "string" ? params.month : null;

  const supabase = await createClient();
  const result = await getDashboardData(supabase, year, month);

  if (!result.ok || result.value.profile.monthly_income <= 0) {
    redirect("/onboarding");
  }

  const { expenses } = result.value;

  // Tab hrefs — preserve the current month param
  const tabBase = monthStr ? `?month=${monthStr}&tab=` : "?tab=";
  const expensesHref = `/dashboard/expenses${tabBase}expenses`;
  const recurringHref = `/dashboard/expenses${tabBase}recurring`;
  const subscriptionsHref = `/dashboard/expenses${tabBase}subscriptions`;

  // Load recurring data
  let recurring: {
    transactions: RecurringTransaction[];
    totalIncome: number;
    totalExpense: number;
    monthPreview: Array<{
      id: string;
      type: string;
      description?: string | null;
      category?: string | null;
      source?: string | null;
      frequency: string;
      occurrenceCount: number;
      monthTotal: number;
    }>;
  } | null = null;

  if (tab === "recurring") {
    const recurringResult = await getRecurringTransactions(supabase);
    const transactions = recurringResult.ok ? recurringResult.value : [];

    const monthPreview = transactions.map((t) => {
      const occurrences = generateOccurrences(t.frequency, t.start_date, year, month);
      return {
        id: t.id,
        type: t.type,
        description: t.description,
        category: t.category,
        source: t.source,
        frequency: t.frequency,
        occurrenceCount: occurrences.length,
        monthTotal: occurrences.length * Number(t.amount),
      };
    });

    recurring = {
      transactions,
      totalIncome: monthPreview
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.monthTotal, 0),
      totalExpense: monthPreview
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.monthTotal, 0),
      monthPreview,
    };
  }

  // Load subscription detection data
  const subscriptionResult =
    tab === "subscriptions" ? await detectSubscriptions(supabase) : null;
  const subscriptions = subscriptionResult?.ok ? subscriptionResult.value : [];

  const subtitleMap: Record<string, string> = {
    expenses: `Add and manage your spending for ${formatMonthLabel(year, month)}`,
    recurring: "Set up automatic income and expenses that repeat on a schedule",
    subscriptions: "Merchants detected across 3+ months — review and manage them",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-budgetu-heading">Expenses</h1>
          <p className="text-budgetu-muted text-sm mt-1">
            {subtitleMap[tab] ?? subtitleMap.expenses}
          </p>
        </div>
        {/* Hide month selector on subscriptions tab — it analyses all-time data */}
        {tab !== "subscriptions" && <MonthSelector year={year} month={month} />}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <Link
          href={expensesHref}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "expenses" || tab === undefined || !["recurring", "subscriptions"].includes(tab)
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Expenses
        </Link>
        <Link
          href={recurringHref}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "recurring"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Recurring
        </Link>
        <Link
          href={subscriptionsHref}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "subscriptions"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Subscriptions
        </Link>
      </div>

      {/* Tab content */}
      {tab === "subscriptions" ? (
        <SubscriptionList subscriptions={subscriptions} />
      ) : tab === "recurring" && recurring ? (
        <div className="space-y-8">
          {recurring.transactions.length > 0 && (
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
                      +${recurring.totalIncome.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-sm text-budgetu-muted">Recurring Expenses</p>
                    <p className="text-2xl font-bold text-budgetu-negative">
                      -${recurring.totalExpense.toFixed(2)}
                    </p>
                  </div>
                </div>

                {recurring.monthPreview.filter((t) => t.occurrenceCount > 0).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-budgetu-heading">
                      This month&apos;s occurrences:
                    </p>
                    {recurring.monthPreview
                      .filter((t) => t.occurrenceCount > 0)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between text-sm py-1"
                        >
                          <span className="text-budgetu-body">
                            {t.description || t.category || t.source || "Recurring"}{" "}
                            <span className="text-budgetu-muted">
                              (
                              {RECURRING_FREQUENCIES[
                                t.frequency as keyof typeof RECURRING_FREQUENCIES
                              ]}
                              , {t.occurrenceCount}x)
                            </span>
                          </span>
                          <span
                            className={`font-medium ${
                              t.type === "income"
                                ? "text-budgetu-positive"
                                : "text-budgetu-negative"
                            }`}
                          >
                            {t.type === "income" ? "+" : "-"}${t.monthTotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <RecurringForm />
          <RecurringList transactions={recurring.transactions} />
        </div>
      ) : (
        <>
          <ExpenseForm />
          <ExpenseList expenses={expenses} />
        </>
      )}
    </div>
  );
}
