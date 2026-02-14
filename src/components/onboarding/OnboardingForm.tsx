"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateMonthlyIncome } from "@/lib/profiles";
import { createSavingsGoal } from "@/lib/savings-goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState("");
  const [goalName, setGoalName] = useState("Emergency Fund");
  const [goalTarget, setGoalTarget] = useState("");
  const [isEmergencyFund, setIsEmergencyFund] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleIncomeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const amount = parseFloat(income);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid income amount.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const result = await updateMonthlyIncome(supabase, amount);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep(2);
  }

  async function handleGoalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const target = parseFloat(goalTarget);
    if (isNaN(target) || target <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const result = await createSavingsGoal(supabase, {
      name: goalName,
      target_amount: target,
      is_emergency_fund: isEmergencyFund,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  function handleSkipGoal() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-[95vw] sm:max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-budgetu-heading">
          {step === 1 ? "Set up your budget" : "Set a savings goal"}
        </CardTitle>
        <CardDescription>
          {step === 1
            ? "How much money do you have coming in each month?"
            : "Having a goal keeps you motivated. You can change this later."}
        </CardDescription>
        <div className="flex justify-center gap-2 mt-4">
          <div
            className={`h-2 w-16 rounded-full ${
              step >= 1 ? "bg-budgetu-accent" : "bg-border"
            }`}
          />
          <div
            className={`h-2 w-16 rounded-full ${
              step >= 2 ? "bg-budgetu-accent" : "bg-border"
            }`}
          />
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <form onSubmit={handleIncomeSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="income"
                className="text-sm font-medium text-budgetu-heading"
              >
                Monthly income ($)
              </label>
              <Input
                id="income"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1500"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                required
                data-testid="onboarding-income"
              />
              <p className="text-xs text-budgetu-muted">
                Include part-time jobs, allowances, financial aid, etc.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
              disabled={loading}
              data-testid="onboarding-income-submit"
            >
              {loading ? "Saving..." : "Continue"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleGoalSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="goalName"
                className="text-sm font-medium text-budgetu-heading"
              >
                Goal name
              </label>
              <Input
                id="goalName"
                type="text"
                placeholder="e.g. Emergency Fund"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                required
                data-testid="onboarding-goal-name"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="goalTarget"
                className="text-sm font-medium text-budgetu-heading"
              >
                Target amount ($)
              </label>
              <Input
                id="goalTarget"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1000"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                required
                data-testid="onboarding-goal-target"
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
              data-testid="onboarding-goal-submit"
            >
              {loading ? "Saving..." : "Set goal & go to dashboard"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-budgetu-body"
              onClick={handleSkipGoal}
            >
              Skip for now
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
