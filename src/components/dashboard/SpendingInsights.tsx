import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { InsightData } from "@/lib/insights";

export default function SpendingInsights({
  insights,
}: {
  insights: InsightData;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Spending Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Risk Score */}
          <div className="text-center">
            <p className="text-sm text-budgetu-muted font-medium mb-1">
              Risk Score
            </p>
            <p className={`text-2xl sm:text-4xl font-bold ${insights.riskColor}`}>
              {insights.riskScore}
            </p>
            <Badge
              variant={
                insights.riskLabel === "Low"
                  ? "secondary"
                  : insights.riskLabel === "Critical"
                    ? "destructive"
                    : "outline"
              }
              className="mt-2"
            >
              {insights.riskLabel}
            </Badge>
          </div>

          {/* Savings Rate */}
          <div className="text-center">
            <p className="text-sm text-budgetu-muted font-medium mb-1">
              Savings Rate
            </p>
            <p
              className={`text-2xl sm:text-4xl font-bold ${
                insights.savingsRate >= 20
                  ? "text-budgetu-positive"
                  : insights.savingsRate >= 10
                    ? "text-budgetu-accent"
                    : "text-destructive"
              }`}
            >
              {insights.savingsRate}%
            </p>
            <Badge variant="secondary" className="mt-2">
              {insights.savingsLabel}
            </Badge>
          </div>

          {/* Emergency Fund */}
          <div className="text-center">
            <p className="text-sm text-budgetu-muted font-medium mb-1">
              Emergency Fund
            </p>
            <p
              className={`text-2xl sm:text-4xl font-bold ${
                insights.hasEmergencyFund
                  ? "text-budgetu-positive"
                  : "text-budgetu-muted"
              }`}
            >
              {insights.hasEmergencyFund ? "Yes" : "No"}
            </p>
            <Badge
              variant={insights.hasEmergencyFund ? "secondary" : "outline"}
              className="mt-2"
            >
              {insights.hasEmergencyFund ? "Active" : "Not started"}
            </Badge>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-sm font-medium text-budgetu-heading mb-3">
            Tips for you
          </p>
          <ul className="space-y-2">
            {insights.tips.map((tip, i) => (
              <li
                key={i}
                className="text-sm text-budgetu-body flex items-start gap-2"
              >
                <span className="text-budgetu-accent mt-0.5 shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
