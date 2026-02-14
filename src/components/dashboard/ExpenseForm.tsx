"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addExpense } from "@/lib/expenses";
import { EXPENSE_CATEGORIES } from "@/lib/types";
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

export default function ExpenseForm() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const result = await addExpense(supabase, {
      amount: parsedAmount,
      category,
      description,
      date,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Reset form
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setLoading(false);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Add Expense
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="amount"
                className="text-sm font-medium text-budgetu-heading"
              >
                Amount ($)
              </label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                data-testid="expense-amount"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-budgetu-heading">
                Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="expense-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-budgetu-heading"
              >
                Description (optional)
              </label>
              <Input
                id="description"
                type="text"
                placeholder="e.g. Chipotle lunch"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="expense-description"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="date"
                className="text-sm font-medium text-budgetu-heading"
              >
                Date
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                data-testid="expense-date"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
            disabled={loading}
            data-testid="expense-submit"
          >
            {loading ? "Adding..." : "Add expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
