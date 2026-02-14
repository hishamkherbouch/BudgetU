import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { YearToDateData } from "@/lib/dashboard";

export default function YearToDateOverview({ data }: { data: YearToDateData }) {
  const { ytdIncome, ytdExpenses, ytdSavings, ytdDebtPayments, ytdRemaining } =
    data;

  const formatCurrency = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Year to Date
        </CardTitle>
        <p className="text-sm text-budgetu-muted">
          Overview of your finances so far this year
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-budgetu-muted font-medium">
              Total Income (YTD)
            </p>
            <p className="text-lg font-semibold text-budgetu-heading mt-1">
              ${formatCurrency(ytdIncome)}
            </p>
          </div>
          <div>
            <p className="text-xs text-budgetu-muted font-medium">
              Total Spent (YTD)
            </p>
            <p className="text-lg font-semibold text-budgetu-heading mt-1">
              ${formatCurrency(ytdExpenses)}
            </p>
          </div>
          <div>
            <p className="text-xs text-budgetu-muted font-medium">
              Total Saved (YTD)
            </p>
            <p className="text-lg font-semibold text-budgetu-accent mt-1">
              ${formatCurrency(ytdSavings)}
            </p>
          </div>
          <div>
            <p className="text-xs text-budgetu-muted font-medium">
              Debt Paid (YTD)
            </p>
            <p className="text-lg font-semibold text-budgetu-heading mt-1">
              ${formatCurrency(ytdDebtPayments)}
            </p>
          </div>
          <div>
            <p className="text-xs text-budgetu-muted font-medium">
              Net (YTD)
            </p>
            <p
              className={`text-lg font-semibold mt-1 ${
                ytdRemaining >= 0 ? "text-budgetu-positive" : "text-destructive"
              }`}
            >
              {ytdRemaining < 0 ? "-" : ""}${formatCurrency(Math.abs(ytdRemaining))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
