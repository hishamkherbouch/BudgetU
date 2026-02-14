"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createDebt } from "@/lib/debts";
import type { DebtType } from "@/lib/types";
import { DEBT_TYPES } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddDebtDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [debtType, setDebtType] = useState<DebtType>("other");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanLength, setLoanLength] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const principalNum = parseFloat(principal);
    const interestNum = parseFloat(interestRate);
    const loanLengthNum = loanLength ? parseInt(loanLength, 10) : null;
    const monthlyNum = parseFloat(monthlyPayment) || 0;

    if (isNaN(principalNum) || principalNum < 0) {
      setError("Please enter a valid principal amount.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const result = await createDebt(supabase, {
      name,
      debt_type: debtType,
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
    setDebtType("other");
    setPrincipal("");
    setInterestRate("");
    setLoanLength("");
    setMonthlyPayment("");
    setLoading(false);
    setOpen(false);
    router.refresh();
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
              Name
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
            <label htmlFor="debt-type" className="text-sm font-medium text-budgetu-heading">
              Type
            </label>
            <Select value={debtType} onValueChange={(v) => setDebtType(v as DebtType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEBT_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                Loan Length (months)
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
              Monthly Payment ($)
            </label>
            <Input
              id="debt-monthly"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
            />
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
