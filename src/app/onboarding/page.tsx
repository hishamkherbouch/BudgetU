import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profiles";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import Link from "next/link";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const result = await getProfile(supabase);

  // If profile exists and income is already set, skip onboarding
  if (result.ok && result.value.monthly_income > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-budgetu-bg flex flex-col items-center justify-center px-6">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <span className="text-budgetu-accent text-3xl font-bold">$</span>
        <span className="text-white text-2xl font-bold">BudgetU</span>
      </Link>
      <OnboardingForm />
    </div>
  );
}
