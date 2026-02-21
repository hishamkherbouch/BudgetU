import type { SavingsGoal, Debt } from "@/lib/types";

export type EducationStatus = "high_priority" | "in_progress" | "complete";

export type TopicPersonalization = {
  status: EducationStatus;
  statusLabel: string;
  personalMessage: string;
  actionLabel?: string;
  actionGoalData?: {
    name: string;
    target_amount: number;
    is_emergency_fund: boolean;
  };
};

export type EducationContext = {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSavings: number;
  goals: SavingsGoal[];
  debts: Debt[];
};

export type EducationPersonalization = {
  monthlyExpenses: number;
  monthlyIncome: number;
  totalSavings: number;
  emergencyFund: TopicPersonalization;
  hysa: TopicPersonalization;
  rothIRA: TopicPersonalization;
  fourOhOneK: TopicPersonalization;
  investing: TopicPersonalization;
};

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function computeEducationPersonalization(
  ctx: EducationContext
): EducationPersonalization {
  const { monthlyIncome, monthlyExpenses, totalSavings, goals, debts } = ctx;

  // --- Emergency fund ---
  const efGoal = goals.find((g) => g.is_emergency_fund);
  const efCurrent = efGoal ? efGoal.current_amount : totalSavings;
  const efTarget =
    monthlyExpenses > 0 ? monthlyExpenses * 3 : monthlyIncome * 3;
  const efProgress = efTarget > 0 ? efCurrent / efTarget : 0;

  let efStatus: EducationStatus;
  let efStatusLabel: string;
  let efMessage: string;

  if (efProgress < 1 / 3) {
    efStatus = "high_priority";
    efStatusLabel = "High Priority";
    efMessage =
      monthlyExpenses > 0
        ? `You spend about $${fmt(monthlyExpenses)}/month, so a 3-month emergency fund target is $${fmt(efTarget)}. You have $${fmt(efCurrent)} saved—${Math.round(efProgress * 100)}% of your goal. Building this safety net should be your first financial priority before tackling other goals.`
        : `Based on your $${fmt(monthlyIncome)} monthly income, aim for $${fmt(efTarget)} as a 3-month emergency fund. You have $${fmt(efCurrent)} saved so far. Start here before anything else.`;
  } else if (efProgress < 1) {
    efStatus = "in_progress";
    efStatusLabel = "In Progress";
    efMessage = `Great progress! You have $${fmt(efCurrent)} of your $${fmt(efTarget)} target saved—${Math.round(efProgress * 100)}% complete. You need $${fmt(Math.max(0, efTarget - efCurrent))} more to hit 3 months of expenses. Keep going—you're closer than you think.`;
  } else {
    efStatus = "complete";
    efStatusLabel = "Strong Position";
    efMessage = `You've reached your 3-month emergency fund target of $${fmt(efTarget)}. You're well protected against unexpected expenses. This achievement frees you up to focus on growth-oriented goals like a Roth IRA or investing.`;
  }

  const emergencyFund: TopicPersonalization = {
    status: efStatus,
    statusLabel: efStatusLabel,
    personalMessage: efMessage,
    ...(!efGoal && efStatus !== "complete"
      ? {
          actionLabel: "Create Emergency Fund Goal",
          actionGoalData: {
            name: "Emergency Fund",
            target_amount: Math.round(efTarget),
            is_emergency_fund: true,
          },
        }
      : {}),
  };

  // --- HYSA ---
  let hysaStatus: EducationStatus;
  let hysaStatusLabel: string;
  let hysaMessage: string;

  if (totalSavings < 500) {
    hysaStatus = "high_priority";
    hysaStatusLabel = "Build Savings First";
    hysaMessage = `You have $${fmt(totalSavings)} in savings. Once you reach $500–$1,000, moving to a high-yield savings account becomes meaningfully impactful. For now, focus on building your emergency fund first.`;
  } else if (totalSavings < 1000) {
    hysaStatus = "in_progress";
    hysaStatusLabel = "Almost Ready";
    hysaMessage = `You have $${fmt(totalSavings)} in savings—you're almost at the $1,000 threshold where an HYSA makes a real difference. At current top rates (~4–5% APY), moving $1,000 could earn you roughly $40–$50/year more than a traditional savings account.`;
  } else {
    hysaStatus = "complete";
    hysaStatusLabel = "Ready to Act";
    const annualGain = Math.round(totalSavings * 0.045);
    hysaMessage = `You're holding $${fmt(totalSavings)} in savings. Moving this to a high-yield savings account at ~4.5% APY could earn you roughly $${fmt(annualGain)}/year in interest with almost no extra effort—a no-brainer upgrade from a traditional bank account.`;
  }

  const hysa: TopicPersonalization = {
    status: hysaStatus,
    statusLabel: hysaStatusLabel,
    personalMessage: hysaMessage,
  };

  // --- Roth IRA ---
  const highInterestDebts = debts.filter((d) => d.interest_rate >= 8);
  const hasHighInterestDebt = highInterestDebts.length > 0;
  const monthlySurplus = monthlyIncome - monthlyExpenses;

  let rothStatus: EducationStatus;
  let rothStatusLabel: string;
  let rothMessage: string;

  if (efStatus === "high_priority") {
    rothStatus = "high_priority";
    rothStatusLabel = "Emergency Fund First";
    rothMessage = `Build your emergency fund before opening a Roth IRA. Without a safety net, one unexpected expense could force you to withdraw from your Roth (and lose the tax-advantaged growth). Once you have 3 months of expenses saved, a Roth IRA becomes a top priority.`;
  } else if (hasHighInterestDebt) {
    rothStatus = "in_progress";
    rothStatusLabel = "Pay High-Interest Debt First";
    const worst = highInterestDebts.reduce((a, b) =>
      a.interest_rate > b.interest_rate ? a : b
    );
    rothMessage = `You have debt at ${worst.interest_rate}% APR (${worst.name}). Paying off debt above 8% APR typically beats investing returns, so it usually makes sense to eliminate that first. Once your high-interest debt is cleared, a Roth IRA becomes a top priority.`;
  } else if (monthlySurplus < 50) {
    rothStatus = "in_progress";
    rothStatusLabel = "Increase Surplus First";
    rothMessage = `Your monthly budget is tight right now. To contribute to a Roth IRA, aim for at least $50/month of breathing room after expenses. Even small Roth contributions ($25–$50/month) make a real difference over decades—start as soon as you have a small surplus.`;
  } else {
    rothStatus = "complete";
    rothStatusLabel = "Ready";
    const monthlyContrib = Math.min(Math.round(monthlySurplus * 0.3), 583);
    rothMessage = `With your emergency fund solid, low high-interest debt, and a ~$${fmt(monthlySurplus)}/month surplus, you're in a great position to open a Roth IRA. Contributing even $${fmt(monthlyContrib)}/month could grow significantly tax-free over your working years—starting in your twenties is one of the best financial moves you can make.`;
  }

  const rothIRA: TopicPersonalization = {
    status: rothStatus,
    statusLabel: rothStatusLabel,
    personalMessage: rothMessage,
  };

  // --- 401k ---
  const fourOhOneKReady = efProgress >= 1 && !hasHighInterestDebt;
  const fourOhOneK: TopicPersonalization = {
    status: fourOhOneKReady ? "complete" : efStatus === "high_priority" ? "high_priority" : "in_progress",
    statusLabel: fourOhOneKReady ? "Check with Your Employer" : "Plan Ahead",
    personalMessage: fourOhOneKReady
      ? `You've handled your emergency fund and high-interest debt. If your employer offers a 401(k) match, contributing at least enough to capture the full match is a near-instant return on your money. Check your employee benefits portal or HR to see what's available.`
      : `Once you've built your emergency fund and addressed any high-interest debt, ask your employer about 401(k) options. The employer match—if offered—is effectively free money and one of the best risk-free returns available. Even small early contributions compound significantly by retirement.`,
  };

  // --- Investing ---
  let investingStatus: EducationStatus;
  let investingStatusLabel: string;
  let investingMessage: string;
  const maxDebtAPR =
    debts.length > 0 ? Math.max(...debts.map((d) => d.interest_rate)) : 0;

  if (efProgress < 0.5) {
    investingStatus = "high_priority";
    investingStatusLabel = "Not Ready Yet";
    investingMessage = `Stock market investing is for money you won't need for 5–10+ years. Right now, the highest-return move is building your emergency fund. Once you have 3 months of expenses saved and manageable debt, you'll be ready to start investing—and time in the market is on your side.`;
  } else if (efProgress < 1 || hasHighInterestDebt) {
    investingStatus = "in_progress";
    investingStatusLabel = "Getting Closer";
    investingMessage = `You're making real financial progress.${hasHighInterestDebt ? ` Eliminate your ${maxDebtAPR}% APR debt first—it's nearly impossible to beat that guaranteed return in the stock market.` : ""} ${efProgress < 1 ? `Then finish your emergency fund ($${fmt(Math.max(0, efTarget - efCurrent))} to go).` : ""} After that, low-cost index funds are a great next step.`;
  } else {
    investingStatus = "complete";
    investingStatusLabel = "Ready to Invest";
    investingMessage = `You're in a solid position to start investing. With a complete emergency fund and manageable debt, extra savings can go toward low-cost index funds or ETFs. Start with your Roth IRA (tax-free growth), then consider a taxable brokerage for additional investing. The key: stay consistent and don't panic-sell during market dips.`;
  }

  const investing: TopicPersonalization = {
    status: investingStatus,
    statusLabel: investingStatusLabel,
    personalMessage: investingMessage,
  };

  return {
    monthlyExpenses,
    monthlyIncome,
    totalSavings,
    emergencyFund,
    hysa,
    rothIRA,
    fourOhOneK,
    investing,
  };
}
