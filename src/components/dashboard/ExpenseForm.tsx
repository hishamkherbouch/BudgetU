"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { addExpense } from "@/lib/expenses";
import { getCategories, addCustomCategory, deleteCustomCategory } from "@/lib/categories";
import type { Category } from "@/lib/types";
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
import { Trash2, Settings } from "lucide-react";

export default function ExpenseForm() {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient();
      const result = await getCategories(supabase);
      if (result.ok) setCategories(result.value);
    }
    loadCategories();
  }, []);

  const customCategories = categories.filter((c) => !c.is_default);

  async function handleAddCustom() {
    const trimmed = customName.trim();
    if (!trimmed) return;

    setError("");
    const supabase = createClient();
    const result = await addCustomCategory(supabase, trimmed);
    if (result.ok) {
      setCategories((prev) => [...prev, result.value]);
      setCategoryId(result.value.id);
      setShowCustomInput(false);
      setCustomName("");
    } else {
      setError(result.error);
    }
  }

  async function handleDeleteCustom(id: string) {
    const supabase = createClient();
    const result = await deleteCustomCategory(supabase, id);
    if (result.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (categoryId === id) setCategoryId("");
    }
  }

  function handleCategoryChange(value: string) {
    if (value === "__custom__") {
      setShowCustomInput(true);
      return;
    }
    setCategoryId(value);
    setShowCustomInput(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    const selectedCat = categories.find((c) => c.id === categoryId);
    if (!selectedCat) {
      setError("Please select a valid category.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const result = await addExpense(supabase, {
      amount: parsedAmount,
      category: selectedCat.name,
      category_id: selectedCat.id,
      description,
      date,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setAmount("");
    setCategoryId("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setLoading(false);
    window.location.reload();
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
              {showCustomInput ? (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="New category name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustom();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
                    onClick={handleAddCustom}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowCustomInput(false); setCustomName(""); setError(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select value={categoryId} onValueChange={handleCategoryChange}>
                    <SelectTrigger data-testid="expense-category" className="flex-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                          {!cat.is_default && " (custom)"}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">
                        + Add custom category
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {customCategories.length > 0 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowManage(!showManage)}
                      title="Manage custom categories"
                      className="text-budgetu-muted hover:text-budgetu-heading shrink-0"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {showManage && customCategories.length > 0 && (
            <div className="rounded-md border border-border p-3 space-y-2">
              <p className="text-sm font-medium text-budgetu-heading">Custom Categories</p>
              {customCategories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <span className="text-sm text-budgetu-heading">{cat.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCustom(cat.id)}
                    className="text-budgetu-muted hover:text-destructive h-7 w-7 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

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
