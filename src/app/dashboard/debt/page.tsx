import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDebts } from "@/lib/debts";
import { getProfile } from "@/lib/profiles";
import DebtsPage from "@/components/dashboard/DebtsPage";

export default async function DebtPage() {
  const supabase = await createClient();
  const profileResult = await getProfile(supabase);
  if (!profileResult.ok || profileResult.value.monthly_income <= 0) {
    redirect("/onboarding");
  }

  const debtsResult = await getDebts(supabase);
  const debts = debtsResult.ok ? debtsResult.value : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-budgetu-heading">Debt & Loans</h1>
        <p className="text-budgetu-muted text-sm mt-1">
          Track student loans, credit cards, car payments, and other debts
        </p>
      </div>
      <DebtsPage initialDebts={debts} />
    </div>
  );
}
