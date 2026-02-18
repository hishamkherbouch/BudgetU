import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import type { CategoryTotal } from "@/lib/dashboard";
import { CATEGORY_COLORS } from "@/lib/constants";
import EmptyState from "@/components/dashboard/EmptyState";

export default function CategoryBreakdown({
  categoryTotals,
}: {
  categoryTotals: CategoryTotal[];
}) {
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

  return (
    <Card className="dark:bg-slate-900/70 dark:backdrop-blur-md dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3.5">
          {categoryTotals.map((cat) => (
            <li key={cat.category}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[0.9375rem] font-medium text-budgetu-heading">
                  {cat.category}
                </span>
                <span className="text-[0.9375rem] font-medium text-budgetu-heading">
                  ${cat.total.toFixed(2)} ({cat.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    CATEGORY_COLORS[cat.category] ?? "bg-budgetu-muted"
                  }`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
