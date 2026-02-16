"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateIncomeSettings } from "@/lib/profiles";
import { PAY_PERIODS, type IncomeFrequency } from "@/lib/types";
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

export default function IncomeSettings({
  currentIncome,
  currentFrequency,
}: {
  currentIncome: number;
  currentFrequency: IncomeFrequency;
}) {
  const [income, setIncome] = useState(currentIncome.toString());
  const [frequency, setFrequency] = useState<IncomeFrequency>(currentFrequency);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    const parsedIncome = parseFloat(income);
    if (isNaN(parsedIncome) || parsedIncome < 0) {
      setError("Please enter a valid income amount.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const result = await updateIncomeSettings(supabase, {
      monthly_income: parsedIncome,
      income_frequency: frequency,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Income Settings
        </CardTitle>
        <p className="text-sm text-budgetu-muted">
          Set your regular income and how often you get paid
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="regular-income"
                className="text-sm font-medium text-budgetu-heading"
              >
                Income Amount ($)
              </label>
              <Input
                id="regular-income"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-budgetu-heading">
                Pay Period
              </label>
              <Select value={frequency} onValueChange={(v) => setFrequency(v as IncomeFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PAY_PERIODS) as [IncomeFrequency, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save settings"}
            </Button>
            {saved && (
              <span className="text-sm text-budgetu-positive font-medium">
                Saved!
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
