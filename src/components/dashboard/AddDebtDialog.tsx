"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { createDebt } from "@/lib/debts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/** Standard amortization formula. Returns null if inputs are invalid. */
function calcMonthlyPayment(
  principal: number,
  annualRatePct: number,
  months: number
): number | null {
  if (principal <= 0 || months <= 0) return null;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return parseFloat((principal / months).toFixed(2));
  const payment = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return parseFloat(payment.toFixed(2));
}

type AddDebtDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function AddDebtDialog({ open: controlledOpen, onOpenChange }: AddDebtDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;
  const [name, setName] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanLength, setLoanLength] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Live-calculate suggested payment when principal + rate + term are filled but payment is blank
  const suggestedPayment = useMemo(() => {
    if (monthlyPayment.trim() !== "") return null; // user is providing their own
    const p = parseFloat(principal);
    const r = parseFloat(interestRate);
    const n = parseInt(loanLength, 10);
    if (isNaN(p) || p <= 0) return null;
    if (isNaN(n) || n <= 0) return null;
    return calcMonthlyPayment(p, isNaN(r) ? 0 : r, n);
  }, [principal, interestRate, loanLength, monthlyPayment]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const principalNum = parseFloat(principal);
    const interestNum = parseFloat(interestRate);
    const loanLengthNum = loanLength ? parseInt(loanLength, 10) : null;

    if (isNaN(principalNum) || principalNum < 0) {
      setError("Please enter a valid principal amount.");
      return;
    }

    // Resolve monthly payment: explicit input > auto-calculated > 0
    let monthlyNum: number;
    if (monthlyPayment.trim() !== "") {
      monthlyNum = parseFloat(monthlyPayment) || 0;
    } else if (suggestedPayment !== null) {
      monthlyNum = suggestedPayment;
    } else {
      monthlyNum = 0;
    }

    setLoading(true);
    const supabase = createClient();
    const result = await createDebt(supabase, {
      name,
      debt_type: "other",
      principal: principalNum,
      interest_rate: isNaN(interestNum) ? 0 : interestNum,
      loan_length_months: loanLengthNum && !isNaN(loanLengthNum) ? loanLengthNum : null,
      monthly_payment: monthlyNum,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setName("");
    setPrincipal("");
    setInterestRate("");
    setLoanLength("");
    setMonthlyPayment("");
    setLoading(false);
    setOpen(false);
    window.location.reload();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-budgetu-accent border-budgetu-accent hover:bg-budgetu-accent/10"
        >
          + Add debt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Debt or Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="debt-name" className="text-sm font-medium text-budgetu-heading">
              Loan Name
            </label>
            <Input
              id="debt-name"
              type="text"
              placeholder="e.g. Federal Student Loans"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="debt-principal" className="text-sm font-medium text-budgetu-heading">
              Current Balance ($)
            </label>
            <Input
              id="debt-principal"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="debt-rate" className="text-sm font-medium text-budgetu-heading">
                Interest Rate (%)
              </label>
              <Input
                id="debt-rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="5.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="debt-length" className="text-sm font-medium text-budgetu-heading">
                Loan Term (months)
              </label>
              <Input
                id="debt-length"
                type="number"
                min="1"
                placeholder="60"
                value={loanLength}
                onChange={(e) => setLoanLength(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="debt-monthly" className="text-sm font-medium text-budgetu-heading">
              Monthly Payment ($){" "}
              <span className="text-budgetu-muted font-normal">(optional)</span>
            </label>
            <Input
              id="debt-monthly"
              type="number"
              min="0"
              step="0.01"
              placeholder={
                suggestedPayment !== null
                  ? `Auto: $${suggestedPayment.toFixed(2)}`
                  : "Leave blank to auto-calculate"
              }
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
            />
            {suggestedPayment !== null && (
              <p className="text-xs text-budgetu-muted">
                Based on your balance, rate, and term — you&apos;d need{" "}
                <span className="font-semibold text-budgetu-heading">
                  ${suggestedPayment.toFixed(2)}/mo
                </span>{" "}
                to pay off in {loanLength} months. Leave this field blank to use that amount, or enter your own.
              </p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add debt"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
