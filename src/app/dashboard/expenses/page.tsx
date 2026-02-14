import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import ExpenseForm from "@/components/dashboard/ExpenseForm";
import ExpenseList from "@/components/dashboard/ExpenseList";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const result = await getDashboardData(supabase);

  if (!result.ok || result.value.profile.monthly_income <= 0) {
    redirect("/onboarding");
  }

  const { expenses } = result.value;
  const now = new Date();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-budgetu-heading">Expenses</h1>
        <p className="text-budgetu-muted text-sm mt-1">
          Add and manage your spending for{" "}
          {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </div>

      <ExpenseForm />
      <ExpenseList expenses={expenses} />
    </div>
  );
}
