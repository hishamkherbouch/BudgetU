"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { deleteExpense } from "@/lib/expenses";
import type { Expense } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import EmptyState from "@/components/dashboard/EmptyState";
import { Trash2 } from "lucide-react";

export default function ExpenseList({
  expenses: initialExpenses,
}: {
  expenses: Expense[];
}) {
  const router = useRouter();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    const result = await deleteExpense(supabase, id);

    if (result.ok) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      router.refresh();
    }
    setDeletingId(null);
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState message="No expenses yet this month. Add your first one above!" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Recent Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0"
              data-testid="expense-row"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Badge variant="secondary" className="shrink-0">
                  {expense.category}
                </Badge>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-budgetu-heading truncate">
                    {expense.description || expense.category}
                  </p>
                  <p className="text-xs text-budgetu-muted">{expense.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold text-budgetu-heading">
                  ${Number(expense.amount).toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(expense.id)}
                  disabled={deletingId === expense.id}
                  className="text-budgetu-muted hover:text-destructive"
                  data-testid="expense-delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
