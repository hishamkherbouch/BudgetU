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
import ConfirmDialog from "@/components/dashboard/ConfirmDialog";

export default function Debts({ debts: initialDebts }: { debts: Debt[] }) {
  const router = useRouter();
  const [debts, setDebts] = useState(initialDebts);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  async function handleDelete() {
    if (!confirmId) return;
    setDeletingId(confirmId);
    const supabase = createClient();
    const result = await deleteDebt(supabase, confirmId);
    if (result.ok) {
      setDebts((prev) => prev.filter((d) => d.id !== confirmId));
      window.location.reload();
    }
    setDeletingId(null);
    setConfirmId(null);
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-budgetu-heading">
          Debt & Loans
        </CardTitle>
        <AddDebtDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      </CardHeader>
      <CardContent>
        {debts.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-budgetu-accent/10 flex items-center justify-center mb-4" aria-hidden>
              <svg className="w-8 h-8 text-budgetu-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-budgetu-muted text-sm mb-4">Track student loans, credit cards, car payments, and more.</p>
            <Button
              className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white font-semibold"
              onClick={() => setAddDialogOpen(true)}
            >
              Add Your First Loan
            </Button>
          </div>
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
                      onClick={() => setConfirmId(debt.id)}
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

    <ConfirmDialog
      open={confirmId !== null}
      onOpenChange={(open) => { if (!open) setConfirmId(null); }}
      title="Delete debt"
      description="Are you sure you want to delete this debt? This action cannot be undone."
      onConfirm={handleDelete}
      loading={deletingId !== null}
    />
    </>
  );
}
