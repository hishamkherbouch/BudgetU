export type AmortizationRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type PayoffResult = {
  months: number;
  payoffDate: Date;
  totalPaid: number;
  totalInterest: number;
  schedule: AmortizationRow[];
};

/**
 * Calculate full amortization schedule for a loan.
 * @param principal - Current outstanding balance
 * @param annualRate - Annual interest rate as a percentage (e.g. 5.5 for 5.5%)
 * @param monthlyPayment - Fixed monthly payment amount
 * @returns PayoffResult, or null if the payment doesn't cover interest
 */
export function calculatePayoff(
  principal: number,
  annualRate: number,
  monthlyPayment: number
): PayoffResult | null {
  if (principal <= 0) {
    return {
      months: 0,
      payoffDate: new Date(),
      totalPaid: 0,
      totalInterest: 0,
      schedule: [],
    };
  }

  const monthlyRate = annualRate / 100 / 12;

  // If 0% interest, simple division
  if (monthlyRate === 0) {
    if (monthlyPayment <= 0) return null;
    const months = Math.ceil(principal / monthlyPayment);
    const schedule: AmortizationRow[] = [];
    let balance = principal;
    for (let i = 1; i <= months; i++) {
      const payment = Math.min(monthlyPayment, balance);
      schedule.push({ month: i, payment, principal: payment, interest: 0, balance: balance - payment });
      balance -= payment;
    }
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);
    return {
      months,
      payoffDate,
      totalPaid: schedule.reduce((s, r) => s + r.payment, 0),
      totalInterest: 0,
      schedule,
    };
  }

  // Monthly interest on current balance must be coverable by payment
  const firstMonthInterest = principal * monthlyRate;
  if (monthlyPayment <= firstMonthInterest) return null;

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let month = 0;
  const MAX_MONTHS = 1200; // 100 years cap

  while (balance > 0 && month < MAX_MONTHS) {
    month++;
    const interest = balance * monthlyRate;
    const payment = Math.min(monthlyPayment, balance + interest);
    const principalPaid = payment - interest;
    balance = Math.max(0, balance - principalPaid);
    schedule.push({
      month,
      payment: parseFloat(payment.toFixed(2)),
      principal: parseFloat(principalPaid.toFixed(2)),
      interest: parseFloat(interest.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
    });
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);

  const totalPaid = schedule.reduce((s, r) => s + r.payment, 0);
  const totalInterest = totalPaid - principal;

  return {
    months: month,
    payoffDate,
    totalPaid: parseFloat(totalPaid.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    schedule,
  };
}

export function formatPayoffDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatMonths(months: number): string {
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mo`;
  if (rem === 0) return `${years} yr`;
  return `${years} yr ${rem} mo`;
}
