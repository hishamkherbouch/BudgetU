"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteSavingsGoal } from "@/lib/savings-goals";
import type { SavingsGoal } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";
import AddGoalDialog from "@/components/dashboard/AddGoalDialog";
import AddSavingsDialog from "@/components/dashboard/AddSavingsDialog";

export default function SavingsGoals({
  goals: initialGoals,
}: {
  goals: SavingsGoal[];
}) {
  const router = useRouter();
  const [goals, setGoals] = useState(initialGoals);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    const result = await deleteSavingsGoal(supabase, id);
    if (result.ok) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
      router.refresh();
    }
    setDeletingId(null);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Savings Goals
        </CardTitle>
        <AddGoalDialog />
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <p className="text-budgetu-muted text-sm">
            No savings goals yet. Create one to start tracking!
          </p>
        ) : (
          <div className="space-y-5">
            {goals.map((goal) => {
              const current = Number(goal.current_amount);
              const target = Number(goal.target_amount);
              const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-budgetu-heading truncate">
                        {goal.name}
                      </span>
                      {goal.is_emergency_fund && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          Emergency
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <AddSavingsDialog goalId={goal.id} goalName={goal.name} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        disabled={deletingId === goal.id}
                        className="text-budgetu-muted hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-budgetu-muted">
                    <span>
                      ${current.toFixed(2)} of ${target.toFixed(2)}
                    </span>
                    <span>{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
