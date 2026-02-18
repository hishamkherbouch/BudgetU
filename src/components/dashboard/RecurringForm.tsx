"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { addRecurringTransaction } from "@/lib/recurring";
import { getCategories } from "@/lib/categories";
import { INCOME_SOURCES, RECURRING_FREQUENCIES } from "@/lib/types";
import type { Category, RecurringFrequency } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function RecurringForm() {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient();
      const result = await getCategories(supabase);
      if (result.ok) setCategories(result.value);
    }
    loadCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (type === "expense" && !categoryId) {
      setError("Please select a category.");
      return;
    }

    if (type === "income" && !source) {
      setError("Please select a source.");
      return;
    }

    const selectedCat = type === "expense"
      ? categories.find((c) => c.id === categoryId)
      : null;

    setLoading(true);
    const supabase = createClient();

    const result = await addRecurringTransaction(supabase, {
      type,
      amount: parsedAmount,
      category: selectedCat?.name ?? null,
      category_id: selectedCat?.id ?? null,
      source: type === "income" ? source : null,
      description: description || null,
      frequency,
      start_date: startDate,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setAmount("");
    setCategoryId("");
    setSource("");
    setDescription("");
    setFrequency("monthly");
    setStartDate(new Date().toISOString().split("T")[0]);
    setLoading(false);
    window.location.reload();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Add Recurring Transaction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-budgetu-heading">
                Type
              </label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as "income" | "expense")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-budgetu-heading">
                Amount ($)
              </label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {type === "expense" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-budgetu-heading">
                  Category
                </label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-budgetu-heading">
                  Source
                </label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-budgetu-heading">
                Frequency
              </label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as RecurringFrequency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RECURRING_FREQUENCIES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-budgetu-heading">
                Description (optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. Monthly rent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-budgetu-heading">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add recurring transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
