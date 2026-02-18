"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { exportAllData } from "@/lib/export";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Download, Upload, ArrowRight } from "lucide-react";

export default function SettingsPage() {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);

  async function handleExport() {
    setExporting(true);
    setExportError("");
    setExportSuccess(false);

    const supabase = createClient();
    const result = await exportAllData(supabase);

    if (!result.ok) {
      setExportError(result.error);
    } else {
      setExportSuccess(true);
    }
    setExporting(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-budgetu-heading">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-budgetu-heading">
            Import Data
          </CardTitle>
          <CardDescription>
            Import expenses from a CSV file exported by your bank or a
            spreadsheet. Duplicates are detected automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white">
            <Link href="/dashboard/import">
              <Upload className="h-4 w-4 mr-2" />
              Import Expenses
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-budgetu-heading">
            Export Data
          </CardTitle>
          <CardDescription>
            Download all your BudgetU data as CSV files. This includes your
            income, expenses, savings contributions, debts, and debt payments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exporting..." : "Export All Data"}
          </Button>

          {exportError && (
            <p className="text-sm text-destructive">{exportError}</p>
          )}
          {exportSuccess && (
            <p className="text-sm text-budgetu-positive">
              Data exported successfully! Check your downloads folder.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
