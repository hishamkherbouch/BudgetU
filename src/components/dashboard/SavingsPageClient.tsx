"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteSavingsGoal } from "@/lib/savings-goals";
import type { SavingsGoal, SavingsContribution } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, CalendarDays, TrendingUp, PiggyBank, Clock } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import AddGoalDialog from "@/components/dashboard/AddGoalDialog";
import AddSavingsDialog from "@/components/dashboard/AddSavingsDialog";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";

type GoalWithContributions = SavingsGoal & {
  contributions: SavingsContribution[];
};

function computeProjected(goal: GoalWithContributions): {
  monthsLeft: number | null;
  projectedDate: string | null;
  avgMonthly: number;
} {
  const contributions = goal.contributions;
  if (contributions.length === 0) {
    return { monthsLeft: null, projectedDate: null, avgMonthly: 0 };
  }

  // Group contributions by month and compute average monthly amount
  const byMonth: Record<string, number> = {};
  for (const c of contributions) {
    const key = c.date.slice(0, 7); // YYYY-MM
    byMonth[key] = (byMonth[key] ?? 0) + Number(c.amount);
  }
  const months = Object.values(byMonth);
  const avgMonthly = months.reduce((a, b) => a + b, 0) / months.length;

  if (avgMonthly <= 0) return { monthsLeft: null, projectedDate: null, avgMonthly: 0 };

  const remaining = Number(goal.target_amount) - Number(goal.current_amount);
  if (remaining <= 0) return { monthsLeft: 0, projectedDate: "Reached!", avgMonthly };

  const monthsLeft = Math.ceil(remaining / avgMonthly);
  const projectedMs = Date.now() + monthsLeft * 30.44 * 24 * 60 * 60 * 1000;
  const projectedDate = new Date(projectedMs).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return { monthsLeft, projectedDate, avgMonthly };
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SavingsPageClient({
  goals: initialGoals,
}: {
  goals: GoalWithContributions[];
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirmId) return;
    setDeletingId(confirmId);
    const supabase = createClient();
    const result = await deleteSavingsGoal(supabase, confirmId);
    if (result.ok) {
      setGoals((prev) => prev.filter((g) => g.id !== confirmId));
    }
    setDeletingId(null);
    setConfirmId(null);
  }

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const completedGoals = goals.filter(
    (g) => Number(g.current_amount) >= Number(g.target_amount)
  ).length;

  return (
    <>
      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-budgetu-surface border border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-budgetu-accent/10">
                <PiggyBank className="w-5 h-5 text-budgetu-accent" />
              </div>
              <div>
                <p className="text-xs text-budgetu-muted">Total Saved</p>
                <p className="text-lg font-bold text-budgetu-heading">
                  ${totalSaved.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-budgetu-surface border border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-budgetu-accent/10">
                <TrendingUp className="w-5 h-5 text-budgetu-accent" />
              </div>
              <div>
                <p className="text-xs text-budgetu-muted">Total Goal</p>
                <p className="text-lg font-bold text-budgetu-heading">
                  ${totalTarget.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-budgetu-surface border border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-budgetu-accent/10">
                <CalendarDays className="w-5 h-5 text-budgetu-accent" />
              </div>
              <div>
                <p className="text-xs text-budgetu-muted">Goals Completed</p>
                <p className="text-lg font-bold text-budgetu-heading">
                  {completedGoals} / {goals.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-budgetu-heading">
            Your Goals
          </CardTitle>
          <AddGoalDialog />
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <EmptyState message="No savings goals yet. Create one to start tracking your progress!" />
          ) : (
            <div className="space-y-6">
              {goals.map((goal) => {
                const current = Number(goal.current_amount);
                const target = Number(goal.target_amount);
                const percentage =
                  target > 0
                    ? Math.min(Math.round((current / target) * 100), 100)
                    : 0;
                const isComplete = current >= target;
                const { monthsLeft, projectedDate, avgMonthly } =
                  computeProjected(goal);
                const isExpanded = expandedId === goal.id;

                return (
                  <div
                    key={goal.id}
                    className="border border-border rounded-xl p-4 space-y-3"
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-budgetu-heading truncate">
                          {goal.name}
                        </span>
                        {goal.is_emergency_fund && (
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-xs"
                          >
                            Emergency
                          </Badge>
                        )}
                        {isComplete && (
                          <Badge className="shrink-0 text-xs bg-budgetu-positive/20 text-budgetu-positive border-0">
                            Complete
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!isComplete && (
                          <AddSavingsDialog
                            goalId={goal.id}
                            goalName={goal.name}
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmId(goal.id)}
                          disabled={deletingId === goal.id}
                          className="text-budgetu-muted hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress */}
                    <Progress value={percentage} className="h-2.5" />
                    <div className="flex justify-between text-xs text-budgetu-muted">
                      <span>
                        ${current.toFixed(2)} of ${target.toFixed(2)}
                      </span>
                      <span className="font-medium">{percentage}%</span>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-budgetu-muted">
                      {goal.target_date && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="w-3.5 h-3.5" />
                          Due {formatDate(goal.target_date)}
                        </span>
                      )}
                      {projectedDate && projectedDate !== "Reached!" && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Projected: {projectedDate}
                          {monthsLeft !== null && monthsLeft > 0 && (
                            <span className="text-budgetu-muted">
                              &nbsp;({monthsLeft}mo)
                            </span>
                          )}
                        </span>
                      )}
                      {avgMonthly > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Avg ${avgMonthly.toFixed(0)}/mo
                        </span>
                      )}
                    </div>

                    {/* Contribution history toggle */}
                    {goal.contributions.length > 0 && (
                      <div>
                        <button
                          type="button"
                          className="text-xs text-budgetu-accent hover:underline"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : goal.id)
                          }
                        >
                          {isExpanded
                            ? "Hide history"
                            : `Show ${goal.contributions.length} contribution${goal.contributions.length !== 1 ? "s" : ""}`}
                        </button>
                        {isExpanded && (
                          <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                            {goal.contributions.map((c) => (
                              <div
                                key={c.id}
                                className="flex justify-between text-xs text-budgetu-body"
                              >
                                <span className="text-budgetu-muted">
                                  {formatDate(c.date)}
                                </span>
                                <span className="font-medium text-budgetu-positive">
                                  +${Number(c.amount).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmId(null);
        }}
        title="Delete savings goal"
        description="Are you sure you want to delete this savings goal? All contribution history will also be removed."
        onConfirm={handleDelete}
        loading={deletingId !== null}
      />
    </>
  );
}
