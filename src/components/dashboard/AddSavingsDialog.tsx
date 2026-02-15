"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateSavingsProgress } from "@/lib/savings-goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AddSavingsDialog({
  goalId,
  goalName,
}: {
  goalId: string;
  goalName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
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
    const result = await updateSavingsProgress(supabase, goalId, parsedAmount);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setAmount("");
    setLoading(false);
    setOpen(false);
    window.location.reload();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-budgetu-accent text-xs">
          + Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to &ldquo;{goalName}&rdquo;</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="savings-amount" className="text-sm font-medium text-budgetu-heading">
              Amount to add ($)
            </label>
            <Input
              id="savings-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add savings"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
