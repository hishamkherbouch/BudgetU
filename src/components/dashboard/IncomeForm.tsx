"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addIncomeEntry } from "@/lib/income";
import { INCOME_SOURCES } from "@/lib/types";
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

export default function IncomeForm() {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
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

    if (!source) {
      setError("Please select a source.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const result = await addIncomeEntry(supabase, {
      amount: parsedAmount,
      source,
      description,
      date,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setAmount("");
    setSource("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setLoading(false);
    window.location.reload();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Log Income
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="income-amount"
                className="text-sm font-medium text-budgetu-heading"
              >
                Amount ($)
              </label>
              <Input
                id="income-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="income-description"
                className="text-sm font-medium text-budgetu-heading"
              >
                Description (optional)
              </label>
              <Input
                id="income-description"
                type="text"
                placeholder="e.g. January paycheck"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="income-date"
                className="text-sm font-medium text-budgetu-heading"
              >
                Date
              </label>
              <Input
                id="income-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
            {loading ? "Adding..." : "Add income"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
