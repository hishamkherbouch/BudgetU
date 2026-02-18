"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { setCategoryBudget, deleteCategoryBudget } from "@/lib/category-budgets";
import type { CategoryBudget } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SlidersHorizontal } from "lucide-react";

export default function SetBudgetDialog({
  categoryName,
  existing,
  onSave,
  onDelete,
}: {
  categoryName: string;
  existing: CategoryBudget | null;
  onSave: (budget: CategoryBudget) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(existing ? String(existing.monthly_limit) : "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = parseFloat(limit);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const result = await setCategoryBudget(supabase, categoryName, parsed);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    onSave(result.value);
    setOpen(false);
  }

  async function handleRemove() {
    if (!existing) return;
    setLoading(true);
    const supabase = createClient();
    const result = await deleteCategoryBudget(supabase, existing.id);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    onDelete(existing.id);
    setLimit("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) setLimit(existing ? String(existing.monthly_limit) : ""); }}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-budgetu-muted hover:text-budgetu-accent transition-colors"
          title={existing ? "Edit budget limit" : "Set budget limit"}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit" : "Set"} limit — {categoryName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="cat-limit" className="text-sm font-medium text-budgetu-heading">
              Monthly limit ($)
            </label>
            <Input
              id="cat-limit"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 200"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1 bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : existing ? "Update limit" : "Set limit"}
            </Button>
            {existing && (
              <Button
                type="button"
                variant="outline"
                className="text-destructive border-destructive/40 hover:bg-destructive/10"
                onClick={handleRemove}
                disabled={loading}
              >
                Remove
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
