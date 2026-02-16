"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteIncomeEntry } from "@/lib/income";
import type { IncomeEntry } from "@/lib/types";
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

export default function IncomeList({
  entries: initialEntries,
}: {
  entries: IncomeEntry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    const result = await deleteIncomeEntry(supabase, id);

    if (result.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      window.location.reload();
    }
    setDeletingId(null);
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Recent Income
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry) => (
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
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold text-budgetu-positive">
                  +${Number(entry.amount).toFixed(2)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  className="text-budgetu-muted hover:text-destructive"
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
