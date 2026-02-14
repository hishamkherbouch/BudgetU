import { Card, CardContent } from "@/components/ui/card";

export default function SummaryCards({
  monthlyIncome,
  totalSpent,
  budgetRemaining,
}: {
  monthlyIncome: number;
  totalSpent: number;
  budgetRemaining: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-budgetu-muted font-medium">
            Monthly Income
          </p>
          <p className="text-2xl font-bold text-budgetu-heading mt-1">
            ${monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-budgetu-muted font-medium">Total Spent</p>
          <p className="text-2xl font-bold text-budgetu-heading mt-1">
            ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-budgetu-muted font-medium">
            Budget Remaining
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              budgetRemaining >= 0
                ? "text-budgetu-positive"
                : "text-destructive"
            }`}
          >
            {budgetRemaining < 0 ? "-" : ""}$
            {Math.abs(budgetRemaining).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
