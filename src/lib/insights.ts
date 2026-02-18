import type { CategoryTotal } from "@/lib/dashboard";
import type { SavingsGoal } from "@/lib/types";

export type InsightData = {
  riskScore: number;
  riskLabel: string;
  riskColor: string;
  savingsRate: number;
  savingsLabel: string;
  topCategory: { name: string; percentage: number } | null;
  tips: string[];
  hasEmergencyFund: boolean;
};

export function computeInsights(
  monthlyIncome: number,
  totalSpent: number,
  categoryTotals: CategoryTotal[],
  savingsGoals: SavingsGoal[]
): InsightData {
  const hasEmergencyFund = savingsGoals.some((g) => g.is_emergency_fund);
  const emergencyFundAtTarget = savingsGoals.some(
    (g) =>
      g.is_emergency_fund &&
      Number(g.current_amount) >= Number(g.target_amount)
  );

  const spendingRatio =
    monthlyIncome > 0 ? totalSpent / monthlyIncome : 0;
  /* Spec: Total_Saved = Income - Expenses, Savings_Rate = (Total_Saved / Income) * 100 */
  const totalSaved = monthlyIncome - totalSpent;
  const savingsRate =
    monthlyIncome > 0
      ? Math.round((totalSaved / monthlyIncome) * 100)
      : 0;

  const topCategory =
    categoryTotals.length > 0
      ? { name: categoryTotals[0].category, percentage: categoryTotals[0].percentage }
      : null;

  // Risk score: start at 50, adjust based on factors
  let riskScore = 50;

  if (spendingRatio > 0.9) {
    riskScore += 30;
  } else if (spendingRatio > 0.75) {
    riskScore += 15;
  } else if (spendingRatio < 0.5) {
    riskScore -= 20;
  }

  if (!hasEmergencyFund) {
    riskScore += 10;
  }

  if (topCategory && topCategory.percentage > 50) {
    riskScore += 10;
  }

  if (emergencyFundAtTarget) {
    riskScore -= 10;
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  // Labels
  let riskLabel: string;
  let riskColor: string;
  if (riskScore <= 25) {
    riskLabel = "Low";
    riskColor = "text-budgetu-positive";
  } else if (riskScore <= 50) {
    riskLabel = "Medium";
    riskColor = "text-budgetu-accent";
  } else if (riskScore <= 75) {
    riskLabel = "High";
    riskColor = "text-orange-500";
  } else {
    riskLabel = "Critical";
    riskColor = "text-destructive";
  }

  let savingsLabel: string;
  if (savingsRate >= 20) {
    savingsLabel = "Great";
  } else if (savingsRate >= 10) {
    savingsLabel = "Okay";
  } else {
    savingsLabel = "Needs Attention";
  }

  // Tips
  const tips: string[] = [];

  if (spendingRatio > 0.8) {
    tips.push(
      `You're spending ${Math.round(spendingRatio * 100)}% of your income. Try to keep it under 80%.`
    );
  }

  if (topCategory && topCategory.percentage > 40) {
    tips.push(
      `${topCategory.name} makes up ${topCategory.percentage}% of your spending. Look for ways to reduce it.`
    );
  }

  if (!hasEmergencyFund) {
    tips.push(
      "Consider starting an emergency fund — even $500 helps cover unexpected costs."
    );
  }

  if (savingsRate >= 20) {
    tips.push(
      `Great job! You're saving ${savingsRate}% of your income. Keep it up!`
    );
  }

  if (tips.length === 0) {
    tips.push("You're doing well! Keep tracking your expenses to stay on top of your budget.");
  }

  return {
    riskScore,
    riskLabel,
    riskColor,
    savingsRate,
    savingsLabel,
    topCategory,
    tips,
    hasEmergencyFund,
  };
}
