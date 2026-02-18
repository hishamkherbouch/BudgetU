"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  deleteRecurringTransaction,
  updateRecurringTransaction,
} from "@/lib/recurring";
import type { RecurringTransaction, RecurringFrequency } from "@/lib/types";
import { RECURRING_FREQUENCIES } from "@/lib/types";
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
import { Trash2, Pencil, Pause, Play } from "lucide-react";

export default function RecurringList({
  transactions: initialTransactions,
}: {
  transactions: RecurringTransaction[];
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editFrequency, setEditFrequency] = useState<RecurringFrequency>("monthly");
  const [editStartDate, setEditStartDate] = useState("");

  function startEdit(t: RecurringTransaction) {
    setEditingId(t.id);
    setEditAmount(String(t.amount));
    setEditDescription(t.description || "");
    setEditFrequency(t.frequency);
    setEditStartDate(t.start_date);
  }

  async function handleSaveEdit(id: string) {
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt <= 0) return;

    const supabase = createClient();
    const result = await updateRecurringTransaction(supabase, id, {
      amount: amt,
      description: editDescription || null,
      frequency: editFrequency,
      start_date: editStartDate,
    });

    if (result.ok) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                amount: amt,
                description: editDescription || null,
                frequency: editFrequency,
                start_date: editStartDate,
              }
            : t
        )
      );
      setEditingId(null);
    }
  }

  async function handleToggleActive(t: RecurringTransaction) {
    const supabase = createClient();
    const result = await updateRecurringTransaction(supabase, t.id, {
      is_active: !t.is_active,
    });

    if (result.ok) {
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === t.id ? { ...item, is_active: !item.is_active } : item
        )
      );
    }
  }

  async function handleDelete() {
    if (!confirmId) return;
    setDeletingId(confirmId);
    const supabase = createClient();
    const result = await deleteRecurringTransaction(supabase, confirmId);

    if (result.ok) {
      setTransactions((prev) => prev.filter((t) => t.id !== confirmId));
    }
    setDeletingId(null);
    setConfirmId(null);
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState message="No recurring transactions yet. Set up automatic income or expenses that repeat on a schedule." />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-budgetu-heading">
            Your Recurring Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((t) =>
              editingId === t.id ? (
                <div
                  key={t.id}
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
                    <Select
                      value={editFrequency}
                      onValueChange={(v) =>
                        setEditFrequency(v as RecurringFrequency)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(RECURRING_FREQUENCIES).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          )
                        )}
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
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
                      onClick={() => handleSaveEdit(t.id)}
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
                  key={t.id}
                  className={`flex items-center justify-between gap-4 py-3 border-b border-border last:border-0 ${
                    !t.is_active ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge
                      variant={t.type === "income" ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {t.type === "income"
                        ? t.source || "Income"
                        : t.category || "Expense"}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-budgetu-heading truncate">
                        {t.description ||
                          (t.type === "income" ? t.source : t.category) ||
                          "Recurring"}
                      </p>
                      <p className="text-xs text-budgetu-muted">
                        {RECURRING_FREQUENCIES[t.frequency]} &middot; starts{" "}
                        {t.start_date}
                        {!t.is_active && " · Paused"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-semibold ${
                        t.type === "income"
                          ? "text-budgetu-positive"
                          : "text-budgetu-negative"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}$
                      {Number(t.amount).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(t)}
                      className="text-budgetu-muted hover:text-budgetu-heading"
                      title={t.is_active ? "Pause" : "Resume"}
                    >
                      {t.is_active ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(t)}
                      className="text-budgetu-muted hover:text-budgetu-heading"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmId(t.id)}
                      className="text-budgetu-muted hover:text-destructive"
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
        onOpenChange={(open) => {
          if (!open) setConfirmId(null);
        }}
        title="Delete recurring transaction"
        description="Are you sure you want to delete this recurring transaction? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deletingId !== null}
      />
    </>
  );
}
