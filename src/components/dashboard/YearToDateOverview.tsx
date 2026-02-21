"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PeriodOverviewData } from "@/lib/dashboard";

type Period = 3 | 6 | 12;

const PERIOD_LABELS: Record<Period, string> = {
  3: "3M",
  6: "6M",
  12: "1Y",
};

export default function PeriodOverview() {
  const [period, setPeriod] = useState<Period>(3);
  const [data, setData] = useState<PeriodOverviewData | null>(null);
  const [fetchedPeriod, setFetchedPeriod] = useState<Period | null>(null);
  const loading = fetchedPeriod !== period;

  useEffect(() => {
    fetch(`/api/period-overview?months=${period}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setFetchedPeriod(period);
      });
  }, [period]);

  const formatCurrency = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold text-budgetu-heading">
              Spending Overview
            </CardTitle>
            <p className="text-sm text-budgetu-muted">
              Your finances over the past {period} months
            </p>
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {([3, 6, 12] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-budgetu-accent text-white"
                    : "bg-card text-budgetu-muted hover:text-budgetu-heading"
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-budgetu-accent border-t-transparent" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-budgetu-muted font-medium">
                  Total Earned
                </p>
                <p className="text-lg font-semibold text-budgetu-positive mt-1">
                  ${formatCurrency(data.totalIncome)}
                </p>
              </div>
              <div>
                <p className="text-xs text-budgetu-muted font-medium">
                  Total Spent
                </p>
                <p className="text-lg font-semibold text-budgetu-heading mt-1">
                  ${formatCurrency(data.totalSpent)}
                </p>
              </div>
              <div>
                <p className="text-xs text-budgetu-muted font-medium">
                  Total Saved
                </p>
                <p className="text-lg font-semibold text-budgetu-accent mt-1">
                  ${formatCurrency(data.totalSaved)}
                </p>
              </div>
              <div>
                <p className="text-xs text-budgetu-muted font-medium">
                  Debt Paid
                </p>
                <p className="text-lg font-semibold text-budgetu-heading mt-1">
                  ${formatCurrency(data.totalDebtPayments)}
                </p>
              </div>
            </div>

            {data.topCategories.length > 0 && (
              <div>
                <p className="text-xs text-budgetu-muted font-medium mb-3">
                  Top Categories
                </p>
                <div className="space-y-2">
                  {data.topCategories.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-budgetu-heading font-medium">
                          {cat.category}
                        </span>
                        <span className="text-xs text-budgetu-muted">
                          {cat.percentage}%
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-budgetu-heading">
                        ${formatCurrency(cat.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
