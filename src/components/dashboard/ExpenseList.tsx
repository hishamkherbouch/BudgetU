"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteExpense, updateExpense } from "@/lib/expenses";
import { getCategories } from "@/lib/categories";
import type { Expense, Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import EmptyState from "@/components/dashboard/EmptyState";
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import { Trash2, Pencil } from "lucide-react";

export default function ExpenseList({
  expenses: initialExpenses,
}: {
  expenses: Expense[];
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient();
      const result = await getCategories(supabase);
      if (result.ok) setCategories(result.value);
    }
    loadCategories();
  }, []);

  function startEdit(expense: Expense) {
    setEditingId(expense.id);
    setEditAmount(String(expense.amount));
    // Find the category by category_id first, fall back to name match
    const cat = categories.find((c) => c.id === expense.category_id)
      ?? categories.find((c) => c.name === expense.category);
    setEditCategory(cat?.id ?? "");
    setEditDescription(expense.description || "");
    setEditDate(expense.date);
  }

  async function handleSaveEdit(id: string) {
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt <= 0) return;

    const supabase = createClient();
    const selectedCat = categories.find((c) => c.id === editCategory);

    const result = await updateExpense(supabase, id, {
      amount: amt,
      category: selectedCat?.name ?? editCategory,
      category_id: selectedCat?.id ?? null,
      description: editDescription || undefined,
      date: editDate,
    });

    if (result.ok) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, amount: amt, category: selectedCat?.name ?? editCategory, category_id: selectedCat?.id ?? null, description: editDescription || null, date: editDate }
            : e
        )
      );
      setEditingId(null);
    }
  }

  async function handleDelete() {
    if (!confirmId) return;
    setDeletingId(confirmId);
    const supabase = createClient();
    const result = await deleteExpense(supabase, confirmId);

    if (result.ok) {
      setExpenses((prev) => prev.filter((e) => e.id !== confirmId));
    }
    setDeletingId(null);
    setConfirmId(null);
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-budgetu-heading">
            Recent Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenses.map((expense) =>
              editingId === expense.id ? (
                <div
                  key={expense.id}
                  className="py-3 border-b border-border last:border-0 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="Amount"
                    />
                    <Select value={editCategory} onValueChange={setEditCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                            {!cat.is_default && " (custom)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                    />
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
                      onClick={() => handleSaveEdit(expense.id)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
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
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-budgetu-heading">
                      ${Number(expense.amount).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(expense)}
                      className="text-budgetu-muted hover:text-budgetu-heading"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmId(expense.id)}
                      className="text-budgetu-muted hover:text-destructive"
                      data-testid="expense-delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => { if (!open) setConfirmId(null); }}
        title="Delete expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deletingId !== null}
      />
    </>
  );
}
