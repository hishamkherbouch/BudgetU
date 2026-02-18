"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CategoryTotal } from "@/lib/dashboard";
import type { CategoryBudget } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/constants";
import EmptyState from "@/components/dashboard/EmptyState";
import SetBudgetDialog from "@/components/dashboard/SetBudgetDialog";

export default function CategoryBreakdown({
  categoryTotals,
  initialBudgets,
}: {
  categoryTotals: CategoryTotal[];
  initialBudgets: CategoryBudget[];
}) {
  const [budgets, setBudgets] = useState(initialBudgets);

  function handleSave(saved: CategoryBudget) {
    setBudgets((prev) => {
      const exists = prev.find((b) => b.id === saved.id);
      if (exists) return prev.map((b) => (b.id === saved.id ? saved : b));
      // new record: replace any old entry for same category (upsert replaced it)
      const filtered = prev.filter((b) => b.category_name !== saved.category_name);
      return [...filtered, saved];
    });
  }

  function handleDelete(id: string) {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }

  if (categoryTotals.length === 0) {
    return (
      <Card className="dark:bg-slate-900/70 dark:backdrop-blur-md dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-budgetu-heading">
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState message="Add some expenses to see your category breakdown." />
        </CardContent>
      </Card>
    );
  }

  const budgetMap = new Map(budgets.map((b) => [b.category_name, b]));

  return (
    <Card className="dark:bg-slate-900/70 dark:backdrop-blur-md dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {categoryTotals.map((cat) => {
            const budget = budgetMap.get(cat.category) ?? null;
            const limit = budget ? Number(budget.monthly_limit) : null;
            const spent = cat.total;

            // If a limit is set, drive the bar off limit; otherwise fall back to % of total
            const barPct =
              limit !== null
                ? Math.min(Math.round((spent / limit) * 100), 100)
                : cat.percentage;

            const isOver = limit !== null && spent > limit;
            const isNear = limit !== null && !isOver && spent / limit >= 0.8;

            const barColor = isOver
              ? "bg-destructive"
              : isNear
                ? "bg-orange-400"
                : (CATEGORY_COLORS[cat.category] ?? "bg-budgetu-muted");

            return (
              <li key={cat.category}>
                <div className="flex justify-between items-center mb-1.5 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[0.9375rem] font-medium text-budgetu-heading truncate">
                      {cat.category}
                    </span>
                    {isOver && (
                      <Badge variant="destructive" className="text-xs shrink-0 py-0">
                        Over
                      </Badge>
                    )}
                    {isNear && !isOver && (
                      <Badge className="text-xs shrink-0 py-0 bg-orange-100 text-orange-700 border-0 dark:bg-orange-900/30 dark:text-orange-400">
                        Near
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-medium text-budgetu-heading tabular-nums">
                      ${spent.toFixed(0)}
                      {limit !== null && (
                        <span className="text-budgetu-muted font-normal">
                          /{limit.toFixed(0)}
                        </span>
                      )}
                    </span>
                    <SetBudgetDialog
                      categoryName={cat.category}
                      existing={budget}
                      onSave={handleSave}
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
                {limit !== null && (
                  <p className="text-xs text-budgetu-muted mt-0.5 text-right">
                    {isOver
                      ? `$${(spent - limit).toFixed(0)} over limit`
                      : `$${(limit - spent).toFixed(0)} remaining`}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-budgetu-muted mt-4 flex items-center gap-1">
          <span>Click</span>
          <span className="inline-flex items-center justify-center w-4 h-4 rounded border border-border">
            ⟳
          </span>
          <span>the sliders icon next to any category to set a monthly limit.</span>
        </p>
      </CardContent>
    </Card>
  );
}
