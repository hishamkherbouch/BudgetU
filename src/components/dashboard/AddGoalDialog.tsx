"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createSavingsGoal } from "@/lib/savings-goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AddGoalDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [isEmergencyFund, setIsEmergencyFund] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const targetAmount = parseFloat(target);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const result = await createSavingsGoal(supabase, {
      name,
      target_amount: targetAmount,
      is_emergency_fund: isEmergencyFund,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setName("");
    setTarget("");
    setIsEmergencyFund(false);
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
          + New goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Savings Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="goal-name" className="text-sm font-medium text-budgetu-heading">
              Goal name
            </label>
            <Input
              id="goal-name"
              type="text"
              placeholder="e.g. New Laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="goal-target" className="text-sm font-medium text-budgetu-heading">
              Target amount ($)
            </label>
            <Input
              id="goal-target"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-budgetu-body cursor-pointer">
            <input
              type="checkbox"
              checked={isEmergencyFund}
              onChange={(e) => setIsEmergencyFund(e.target.checked)}
              className="rounded border-border accent-budgetu-accent"
            />
            This is an emergency fund
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
