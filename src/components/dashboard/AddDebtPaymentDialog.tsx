"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addDebtPayment } from "@/lib/debts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AddDebtPaymentDialog({
  debtId,
  debtName,
  monthlyPayment,
}: {
  debtId: string;
  debtName: string;
  monthlyPayment: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(monthlyPayment > 0 ? String(monthlyPayment) : "");
  const [isExtra, setIsExtra] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const result = await addDebtPayment(supabase, debtId, {
      amount: parsedAmount,
      date: today,
      is_extra: isExtra,
      notes: notes || undefined,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setAmount(monthlyPayment > 0 ? String(monthlyPayment) : "");
    setIsExtra(false);
    setNotes("");
    setLoading(false);
    setOpen(false);
    window.location.reload();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-budgetu-accent text-xs">
          + Add payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment to &ldquo;{debtName}&rdquo;</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="payment-amount" className="text-sm font-medium text-budgetu-heading">
              Amount ($)
            </label>
            <Input
              id="payment-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder={monthlyPayment > 0 ? String(monthlyPayment) : "0.00"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-budgetu-body cursor-pointer">
            <input
              type="checkbox"
              checked={isExtra}
              onChange={(e) => setIsExtra(e.target.checked)}
              className="rounded border-border accent-budgetu-accent"
            />
            Extra payment (beyond monthly)
          </label>
          <div className="space-y-2">
            <label htmlFor="payment-notes" className="text-sm font-medium text-budgetu-heading">
              Notes (optional)
            </label>
            <Input
              id="payment-notes"
              type="text"
              placeholder="e.g. Year-end bonus payment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
