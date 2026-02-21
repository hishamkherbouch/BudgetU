import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BudgetSummary } from "@/lib/dashboard";
import { Info } from "lucide-react";

function FormulaTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 inline-block ml-1 text-budgetu-muted cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px] text-xs">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function fmt(n: number): string {
  return Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export default function SummaryCards({ budget }: { budget: BudgetSummary }) {
  const {
    incomeTotal,
    expenseTotal,
    savingsTotal,
    debtPaidTotal,
    budgetRemaining,
    savingsRate,
  } = budget;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-budgetu-muted font-medium">
            Income
            <FormulaTooltip text="Sum of all income entries this month. Falls back to your base income if no entries logged." />
          </p>
          <p className="text-2xl font-bold text-budgetu-heading mt-1">
            ${fmt(incomeTotal)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-budgetu-muted font-medium">
            Spent
            <FormulaTooltip text="Sum of all expenses this month." />
          </p>
          <p className="text-2xl font-bold text-budgetu-heading mt-1">
            ${fmt(expenseTotal)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-budgetu-muted font-medium">
            Saved
            <FormulaTooltip text="Sum of all savings contributions this month." />
          </p>
          <p className="text-2xl font-bold text-budgetu-accent mt-1">
            ${fmt(savingsTotal)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-budgetu-muted font-medium">
            Debt Paid
            <FormulaTooltip text="Sum of all debt payments this month." />
          </p>
          <p className="text-2xl font-bold text-budgetu-heading mt-1">
            ${fmt(debtPaidTotal)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-budgetu-muted font-medium">
            Remaining
            <FormulaTooltip text="Income - (Expenses + Savings + Debt Payments)" />
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              budgetRemaining >= 0
                ? "text-budgetu-positive"
                : "text-destructive"
            }`}
          >
            {budgetRemaining < 0 ? "-" : ""}${fmt(budgetRemaining)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-budgetu-muted font-medium">
            Savings Rate
            <FormulaTooltip text="(Income − Expenses) ÷ Income. Aim for 20% or higher." />
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              savingsRate >= 0.2
                ? "text-budgetu-positive"
                : savingsRate >= 0.1
                ? "text-budgetu-accent"
                : "text-budgetu-heading"
            }`}
          >
            {Math.round(savingsRate * 100)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
