import type { BudgetSummary } from "@/lib/dashboard";

function fmt(n: number): string {
  return Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export default function HeroBudgetCard({ budget }: { budget: BudgetSummary }) {
  const { budgetRemaining } = budget;

  return (
    <div
      className="relative rounded-2xl p-6 sm:p-8 bg-card border border-border shadow-sm"
      style={{
        boxShadow:
          budgetRemaining >= 0
            ? "0 0 0 1px rgb(34 197 94 / 0.2), 0 0 24px -4px rgb(34 197 94 / 0.15)"
            : "0 0 0 1px rgb(239 68 68 / 0.2), 0 0 24px -4px rgb(239 68 68 / 0.15)",
      }}
    >
      <p className="text-budgetu-muted font-medium text-sm uppercase tracking-wider">
        Available to Spend
      </p>
      <p
        className={`text-3xl sm:text-4xl font-bold mt-2 ${
          budgetRemaining >= 0
            ? "text-budgetu-positive"
            : "text-destructive"
        }`}
      >
        {budgetRemaining < 0 ? "-" : ""}${fmt(budgetRemaining)}
      </p>
      <p className="text-budgetu-body text-sm mt-1">
        After expenses, savings & debt this month
      </p>
    </div>
  );
}
