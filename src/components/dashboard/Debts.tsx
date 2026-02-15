"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { deleteDebt } from "@/lib/debts";
import type { Debt } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronRight } from "lucide-react";
import AddDebtDialog from "@/components/dashboard/AddDebtDialog";
import AddDebtPaymentDialog from "@/components/dashboard/AddDebtPaymentDialog";

export default function Debts({ debts: initialDebts }: { debts: Debt[] }) {
  const router = useRouter();
  const [debts, setDebts] = useState(initialDebts);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    const result = await deleteDebt(supabase, id);
    if (result.ok) {
      setDebts((prev) => prev.filter((d) => d.id !== id));
      window.location.reload();
    }
    setDeletingId(null);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Debt & Loans
        </CardTitle>
        <AddDebtDialog />
      </CardHeader>
      <CardContent>
        {debts.length === 0 ? (
          <p className="text-budgetu-muted text-sm">
            No debts or loans yet. Add one to track payments!
          </p>
        ) : (
          <div className="space-y-4">
            {debts.slice(0, 3).map((debt) => {
              const principal = Number(debt.principal);
              const monthly = Number(debt.monthly_payment);

              return (
                <div
                  key={debt.id}
                  className="flex items-center justify-between gap-2 p-3 rounded-lg bg-budgetu-surface-alt border border-border"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-budgetu-heading block truncate">
                      {debt.name}
                    </span>
                    <p className="text-xs text-budgetu-muted mt-0.5">
                      ${principal.toFixed(2)} owed
                      {debt.interest_rate > 0 && ` · ${debt.interest_rate}% APR`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <AddDebtPaymentDialog
                      debtId={debt.id}
                      debtName={debt.name}
                      monthlyPayment={monthly}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(debt.id)}
                      disabled={deletingId === debt.id}
                      className="text-budgetu-muted hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Link href={`/dashboard/debt?debt=${debt.id}`}>
                      <Button variant="ghost" size="sm" className="p-1">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
            {debts.length > 3 && (
              <Link href="/dashboard/debt" className="block">
                <Button
                  variant="ghost"
                  className="w-full text-budgetu-accent hover:bg-budgetu-accent/10"
                >
                  View all {debts.length} debts →
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
