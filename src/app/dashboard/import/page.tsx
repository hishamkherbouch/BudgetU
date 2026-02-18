"use client";

import { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/client";
import { getCategories } from "@/lib/categories";
import {
  autoCategorize,
  computeHash,
  getExistingHashes,
  importExpenses,
  type ParsedExpense,
  type ColumnMapping,
} from "@/lib/import";
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
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertTriangle, CheckCircle } from "lucide-react";

type Step = "upload" | "map" | "preview" | "done";

export default function ImportPage() {
  const [step, setStep] = useState<Step>("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: "",
    amount: "",
    description: "",
  });
  const [parsedExpenses, setParsedExpenses] = useState<ParsedExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const result = await getCategories(supabase);
      if (result.ok) setCategories(result.value);
    }
    load();
  }, []);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        if (results.errors.length > 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }

        const headers = results.meta.fields ?? [];
        const rows = results.data as Record<string, string>[];

        if (headers.length === 0 || rows.length === 0) {
          setError("CSV file is empty or has no headers.");
          return;
        }

        setCsvHeaders(headers);
        setCsvRows(rows);

        // Try to auto-detect column mapping
        const lower = headers.map((h) => h.toLowerCase());
        const dateCol = headers.find((_, i) =>
          ["date", "transaction date", "trans date", "posted date"].includes(lower[i])
        );
        const amountCol = headers.find((_, i) =>
          ["amount", "debit", "charge", "total", "price"].includes(lower[i])
        );
        const descCol = headers.find((_, i) =>
          ["description", "memo", "name", "merchant", "payee", "details", "transaction"].includes(lower[i])
        );

        setMapping({
          date: dateCol ?? "",
          amount: amountCol ?? "",
          description: descCol ?? "",
        });

        setStep("map");
      },
      error(err) {
        setError(`Failed to read CSV: ${err.message}`);
      },
    });
  }

  const processMapping = useCallback(async () => {
    if (!mapping.date || !mapping.amount || !mapping.description) {
      setError("Please map all required columns.");
      return;
    }

    setError("");

    const supabase = createClient();
    const hashResult = await getExistingHashes(supabase);
    if (!hashResult.ok) {
      setError(hashResult.error);
      return;
    }

    const existingHashes = hashResult.value;
    const parsed: ParsedExpense[] = [];

    for (const row of csvRows) {
      const rawDate = row[mapping.date]?.trim();
      const rawAmount = row[mapping.amount]?.trim();
      const rawDesc = row[mapping.description]?.trim() || "";

      if (!rawDate || !rawAmount) continue;

      // Parse amount — handle negative values (credits), remove $, commas
      const cleanAmount = rawAmount.replace(/[$,]/g, "");
      const amount = Math.abs(parseFloat(cleanAmount));
      if (isNaN(amount) || amount <= 0) continue;

      // Parse date — handle common formats
      const date = parseDate(rawDate);
      if (!date) continue;

      const { name, id } = autoCategorize(rawDesc, categories);
      const hash = computeHash(date, amount, rawDesc);

      parsed.push({
        date,
        amount,
        description: rawDesc,
        category: name,
        category_id: id,
        hash,
        isDuplicate: existingHashes.has(hash),
      });
    }

    if (parsed.length === 0) {
      setError("No valid rows found. Check your column mapping and date/amount formats.");
      return;
    }

    setParsedExpenses(parsed);
    setStep("preview");
  }, [mapping, csvRows, categories]);

  async function handleImport() {
    setImporting(true);
    setError("");

    const supabase = createClient();
    const result = await importExpenses(supabase, parsedExpenses);

    if (!result.ok) {
      setError(result.error);
      setImporting(false);
      return;
    }

    setImportedCount(result.value);
    setImporting(false);
    setStep("done");
  }

  const duplicateCount = parsedExpenses.filter((e) => e.isDuplicate).length;
  const newCount = parsedExpenses.filter((e) => !e.isDuplicate).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-budgetu-heading">Import Expenses</h1>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-budgetu-heading">
              Upload CSV File
            </CardTitle>
            <CardDescription>
              Upload a CSV file from your bank or spreadsheet. Common formats from
              Chase, Bank of America, and most banks are supported.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto mb-3 text-budgetu-muted" />
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
              <p className="text-sm text-budgetu-muted mt-2">
                CSV files only. Max recommended: 500 rows.
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Map Columns */}
      {step === "map" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-budgetu-heading">
              Map Columns
            </CardTitle>
            <CardDescription>
              Tell us which columns in your CSV correspond to date, amount, and
              description. We detected {csvRows.length} rows.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-budgetu-heading">
                  Date Column *
                </label>
                <Select value={mapping.date} onValueChange={(v) => setMapping((m) => ({ ...m, date: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvHeaders.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-budgetu-heading">
                  Amount Column *
                </label>
                <Select value={mapping.amount} onValueChange={(v) => setMapping((m) => ({ ...m, amount: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvHeaders.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-budgetu-heading">
                  Description Column *
                </label>
                <Select value={mapping.description} onValueChange={(v) => setMapping((m) => ({ ...m, description: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {csvHeaders.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview first 3 rows */}
            {csvRows.length > 0 && (
              <div className="overflow-x-auto">
                <p className="text-sm text-budgetu-muted mb-2">Preview (first 3 rows):</p>
                <table className="w-full text-sm border border-border">
                  <thead>
                    <tr className="bg-muted/50">
                      {csvHeaders.map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-budgetu-heading border-b border-border">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-b border-border">
                        {csvHeaders.map((h) => (
                          <td key={h} className="px-3 py-2 text-budgetu-body">
                            {row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button
                onClick={processMapping}
                className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
              >
                Continue to Preview
              </Button>
              <Button variant="ghost" onClick={() => { setStep("upload"); setError(""); }}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-budgetu-heading">
              Review Import
            </CardTitle>
            <CardDescription>
              {parsedExpenses.length} expenses parsed.{" "}
              {duplicateCount > 0 && (
                <span className="text-yellow-600">
                  {duplicateCount} duplicate{duplicateCount !== 1 ? "s" : ""} detected and will be skipped.
                </span>
              )}{" "}
              <strong>{newCount}</strong> new expense{newCount !== 1 ? "s" : ""} will be imported.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm border border-border">
                <thead className="sticky top-0 bg-budgetu-surface">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-budgetu-heading border-b border-border">Status</th>
                    <th className="px-3 py-2 text-left font-medium text-budgetu-heading border-b border-border">Date</th>
                    <th className="px-3 py-2 text-left font-medium text-budgetu-heading border-b border-border">Amount</th>
                    <th className="px-3 py-2 text-left font-medium text-budgetu-heading border-b border-border">Description</th>
                    <th className="px-3 py-2 text-left font-medium text-budgetu-heading border-b border-border">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedExpenses.map((exp, i) => (
                    <tr
                      key={i}
                      className={`border-b border-border ${exp.isDuplicate ? "opacity-50" : ""}`}
                    >
                      <td className="px-3 py-2">
                        {exp.isDuplicate ? (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Duplicate
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-budgetu-positive border-budgetu-positive">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-2 text-budgetu-body">{exp.date}</td>
                      <td className="px-3 py-2 text-budgetu-body">${exp.amount.toFixed(2)}</td>
                      <td className="px-3 py-2 text-budgetu-body truncate max-w-[200px]">{exp.description}</td>
                      <td className="px-3 py-2">
                        <Badge variant="secondary">{exp.category}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={importing || newCount === 0}
                className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
              >
                {importing ? "Importing..." : `Import ${newCount} Expense${newCount !== 1 ? "s" : ""}`}
              </Button>
              <Button variant="ghost" onClick={() => { setStep("map"); setError(""); }}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Done */}
      {step === "done" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-budgetu-heading">
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-budgetu-positive" />
              <div>
                <p className="text-lg font-semibold text-budgetu-heading">
                  Successfully imported {importedCount} expense{importedCount !== 1 ? "s" : ""}!
                </p>
                <p className="text-sm text-budgetu-muted">
                  Your expenses are now visible on the Expenses page.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.href = "/dashboard/expenses"}
                className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
              >
                View Expenses
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("upload");
                  setCsvHeaders([]);
                  setCsvRows([]);
                  setParsedExpenses([]);
                  setError("");
                }}
              >
                Import More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Parse common date formats into YYYY-MM-DD */
function parseDate(raw: string): string | null {
  // Try ISO format first: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // MM/DD/YYYY or M/D/YYYY
  const usMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // MM-DD-YYYY
  const dashMatch = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dashMatch) {
    const [, m, d, y] = dashMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Try Date constructor as fallback
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }

  return null;
}
