import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDebtById, getDebtPaymentsForDebt } from "@/lib/debts";
import { getProfile } from "@/lib/profiles";
import PayoffSimulator from "@/components/dashboard/PayoffSimulator";

export default async function DebtDetailPage({
  params,
}: {
  params: Promise<{ debtId: string }>;
}) {
  const { debtId } = await params;

  const supabase = await createClient();

  const profileResult = await getProfile(supabase);
  if (!profileResult.ok || profileResult.value.monthly_income <= 0) {
    redirect("/onboarding");
  }

  const debtResult = await getDebtById(supabase, debtId);
  if (!debtResult.ok) notFound();

  const paymentsResult = await getDebtPaymentsForDebt(supabase, debtId);
  const payments = paymentsResult.ok ? paymentsResult.value : [];

  return (
    <div className="space-y-8">
      <PayoffSimulator debt={debtResult.value} payments={payments} />
    </div>
  );
}
