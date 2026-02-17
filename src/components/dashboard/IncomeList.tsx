"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteIncomeEntry, updateIncomeEntry } from "@/lib/income";
import type { IncomeEntry } from "@/lib/types";
import { INCOME_SOURCES } from "@/lib/types";
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

export default function IncomeList({
  entries: initialEntries,
}: {
  entries: IncomeEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");

  function startEdit(entry: IncomeEntry) {
    setEditingId(entry.id);
    setEditAmount(String(entry.amount));
    setEditSource(entry.source);
    setEditDescription(entry.description || "");
    setEditDate(entry.date);
  }

  async function handleSaveEdit(id: string) {
    const amt = parseFloat(editAmount);
    if (isNaN(amt) || amt <= 0) return;

    const supabase = createClient();
    const result = await updateIncomeEntry(supabase, id, {
      amount: amt,
      source: editSource,
      description: editDescription || undefined,
      date: editDate,
    });

    if (result.ok) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, amount: amt, source: editSource, description: editDescription || null, date: editDate }
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
    const result = await deleteIncomeEntry(supabase, confirmId);

    if (result.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== confirmId));
    }
    setDeletingId(null);
    setConfirmId(null);
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState message="No income logged this month. Add your first entry above!" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-budgetu-heading">
            Recent Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entries.map((entry) =>
              editingId === entry.id ? (
                <div
                  key={entry.id}
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
                    <Select value={editSource} onValueChange={setEditSource}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INCOME_SOURCES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
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
                      onClick={() => handleSaveEdit(entry.id)}
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
                  key={entry.id}
                  className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge variant="secondary" className="shrink-0">
                      {entry.source}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-budgetu-heading truncate">
                        {entry.description || entry.source}
                      </p>
                      <p className="text-xs text-budgetu-muted">{entry.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-budgetu-positive">
                      +${Number(entry.amount).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(entry)}
                      className="text-budgetu-muted hover:text-budgetu-heading"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmId(entry.id)}
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
        onOpenChange={(open) => { if (!open) setConfirmId(null); }}
        title="Delete income entry"
        description="Are you sure you want to delete this income entry? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deletingId !== null}
      />
    </>
  );
}
