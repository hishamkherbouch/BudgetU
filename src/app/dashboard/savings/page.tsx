import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profiles";
import { getSavingsGoals, getGoalContributions } from "@/lib/savings-goals";
import SavingsPageClient from "@/components/dashboard/SavingsPageClient";

export default async function SavingsPage() {
  const supabase = await createClient();

  const profileResult = await getProfile(supabase);
  if (!profileResult.ok || profileResult.value.monthly_income <= 0) {
    redirect("/onboarding");
  }

  const goalsResult = await getSavingsGoals(supabase);
  const goals = goalsResult.ok ? goalsResult.value : [];

  // Fetch contributions for each goal in parallel
  const goalsWithContributions = await Promise.all(
    goals.map(async (goal) => {
      const contribResult = await getGoalContributions(supabase, goal.id);
      return {
        ...goal,
        contributions: contribResult.ok ? contribResult.value : [],
      };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-budgetu-heading">Savings Goals</h1>
        <p className="text-budgetu-muted text-sm mt-1">
          Track your progress and projected completion dates
        </p>
      </div>
      <SavingsPageClient goals={goalsWithContributions} />
    </div>
  );
}
