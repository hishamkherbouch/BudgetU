export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profiles";
import { getMonthIncomeEntries } from "@/lib/income";
import { parseMonth, formatMonthLabel } from "@/lib/month";
import MonthSelector from "@/components/dashboard/MonthSelector";
import IncomeSettings from "@/components/dashboard/IncomeSettings";
import IncomeForm from "@/components/dashboard/IncomeForm";
import IncomeList from "@/components/dashboard/IncomeList";

export default async function IncomePage({
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

  const profile = profileResult.value;

  const entriesResult = await getMonthIncomeEntries(supabase, year, month);
  const entries = entriesResult.ok ? entriesResult.value : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-budgetu-heading">Income</h1>
          <p className="text-budgetu-muted text-sm mt-1">
            Manage your income settings and log money you receive for{" "}
            {formatMonthLabel(year, month)}
          </p>
        </div>
        <MonthSelector year={year} month={month} />
      </div>

      <IncomeSettings
        currentIncome={Number(profile.monthly_income)}
        currentFrequency={profile.income_frequency}
      />
      <IncomeForm />
      <IncomeList entries={entries} />
    </div>
  );
}
