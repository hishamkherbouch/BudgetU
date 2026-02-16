export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profiles";
import { getMonthIncomeEntries } from "@/lib/income";
import IncomeSettings from "@/components/dashboard/IncomeSettings";
import IncomeForm from "@/components/dashboard/IncomeForm";
import IncomeList from "@/components/dashboard/IncomeList";

export default async function IncomePage() {
  const supabase = await createClient();
  const profileResult = await getProfile(supabase);

  if (!profileResult.ok || profileResult.value.monthly_income <= 0) {
    redirect("/onboarding");
  }

  const profile = profileResult.value;
  const now = new Date();

  const entriesResult = await getMonthIncomeEntries(
    supabase,
    now.getFullYear(),
    now.getMonth() + 1
  );
  const entries = entriesResult.ok ? entriesResult.value : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-budgetu-heading">Income</h1>
        <p className="text-budgetu-muted text-sm mt-1">
          Manage your income settings and log money you receive for{" "}
          {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
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
