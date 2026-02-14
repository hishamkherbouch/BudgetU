import { Card, CardContent } from "@/components/ui/card";

export default function SummaryCards({
  monthlyIncome,
  totalSpent,
  totalSavingsThisMonth,
  totalDebtPaymentsThisMonth,
  budgetRemaining,
}: {
  monthlyIncome: number;
  totalSpent: number;
  totalSavingsThisMonth: number;
  totalDebtPaymentsThisMonth: number;
  budgetRemaining: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
            Savings This Month
          </p>
          <p className="text-2xl font-bold text-budgetu-accent mt-1">
            ${totalSavingsThisMonth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-budgetu-muted font-medium">
            Debt Payments This Month
          </p>
          <p className="text-2xl font-bold text-budgetu-heading mt-1">
            ${totalDebtPaymentsThisMonth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-budgetu-muted font-medium">
            Budget Remaining
          </p>
          <p className="text-xs text-budgetu-muted mt-0.5">
            After expenses, savings & debt
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
