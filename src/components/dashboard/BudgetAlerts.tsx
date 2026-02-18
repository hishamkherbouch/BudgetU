import type { CategoryTotal } from "@/lib/dashboard";
import type { CategoryBudget } from "@/lib/types";
import { AlertTriangle } from "lucide-react";

export default function BudgetAlerts({
  categoryTotals,
  categoryBudgets,
}: {
  categoryTotals: CategoryTotal[];
  categoryBudgets: CategoryBudget[];
}) {
  const budgetMap = new Map(categoryBudgets.map((b) => [b.category_name, b]));

  const overBudget = categoryTotals
    .filter((cat) => {
      const b = budgetMap.get(cat.category);
      return b && cat.total > Number(b.monthly_limit);
    })
    .map((cat) => {
      const limit = Number(budgetMap.get(cat.category)!.monthly_limit);
      return {
        category: cat.category,
        spent: cat.total,
        limit,
        over: cat.total - limit,
      };
    });

  if (overBudget.length === 0) return null;

  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 flex gap-3">
      <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-destructive mb-1">
          {overBudget.length === 1
            ? "1 category is over budget this month"
            : `${overBudget.length} categories are over budget this month`}
        </p>
        <ul className="space-y-0.5">
          {overBudget.map(({ category, spent, limit, over }) => (
            <li key={category} className="text-sm text-budgetu-body">
              <span className="font-medium">{category}</span>
              {" — "}
              <span className="text-destructive font-medium">
                ${over.toFixed(2)} over
              </span>
              <span className="text-budgetu-muted">
                {" "}(${spent.toFixed(2)} of ${limit.toFixed(2)} limit)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
