"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getDebtPaymentsForDebt,
  deleteDebtPayment,
  updateDebtPayment,
} from "@/lib/debts";
import type { Debt, DebtPayment } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil } from "lucide-react";
import AddDebtDialog from "@/components/dashboard/AddDebtDialog";
import AddDebtPaymentDialog from "@/components/dashboard/AddDebtPaymentDialog";

function DebtsPageInner({ initialDebts }: { initialDebts: Debt[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDebtId = searchParams.get("debt");

  const [debts, setDebts] = useState(initialDebts);
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedDebt = debts.find((d) => d.id === selectedDebtId);

  useEffect(() => {
    setDebts(initialDebts);
  }, [initialDebts]);

  useEffect(() => {
    if (!selectedDebtId) {
      setPayments([]);
      return;
    }
    const debtId: string = selectedDebtId;
    async function loadPayments() {
      setLoadingPayments(true);
      const supabase = createClient();
      const result = await getDebtPaymentsForDebt(supabase, debtId);
      if (result.ok) setPayments(result.value);
      setLoadingPayments(false);
    }
    loadPayments();
  }, [selectedDebtId]);

  async function handleDeletePayment(paymentId: string, debtId: string) {
    setDeletingId(paymentId);
    const supabase = createClient();
    const result = await deleteDebtPayment(supabase, paymentId, debtId);
    if (result.ok) {
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      router.refresh();
    }
    setDeletingId(null);
  }

  async function handleUpdatePayment(
    paymentId: string,
    debtId: string,
    newAmount: number
  ) {
    const supabase = createClient();
    const result = await updateDebtPayment(supabase, paymentId, debtId, {
      amount: newAmount,
    });
    if (result.ok) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, amount: newAmount } : p
        )
      );
      setEditingPaymentId(null);
      router.refresh();
    }
  }

  function clearSelection() {
    router.push("/dashboard/debt");
    setPayments([]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AddDebtDialog />
      </div>

      {selectedDebt ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="mb-2 -ml-2"
                onClick={clearSelection}
              >
                ← Back to all debts
              </Button>
              <CardTitle className="text-lg font-bold text-budgetu-heading">
                {selectedDebt.name}
              </CardTitle>
              <p className="text-sm text-budgetu-muted mt-1">
                Balance: ${Number(selectedDebt.principal).toFixed(2)}
                {selectedDebt.interest_rate > 0 &&
                  ` · ${selectedDebt.interest_rate}% APR`}
                {selectedDebt.monthly_payment > 0 &&
                  ` · $${Number(selectedDebt.monthly_payment).toFixed(2)}/mo`}
              </p>
            </div>
            <AddDebtPaymentDialog
              debtId={selectedDebt.id}
              debtName={selectedDebt.name}
              monthlyPayment={Number(selectedDebt.monthly_payment)}
            />
          </CardHeader>
          <CardContent>
            <h3 className="text-sm font-semibold text-budgetu-heading mb-3">
              Payment History
            </h3>
            {loadingPayments ? (
              <p className="text-budgetu-muted text-sm">Loading...</p>
            ) : payments.length === 0 ? (
              <p className="text-budgetu-muted text-sm">
                No payments yet. Add one above!
              </p>
            ) : (
              <ul className="space-y-2">
                {payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg bg-[#f9fafb] border border-border"
                  >
                    {editingPaymentId === payment.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-24"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const amt = parseFloat(editAmount);
                            if (!isNaN(amt) && amt > 0) {
                              handleUpdatePayment(payment.id, payment.debt_id, amt);
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingPaymentId(null);
                            setEditAmount("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium text-budgetu-heading">
                            ${Number(payment.amount).toFixed(2)}
                          </span>
                          <span className="text-budgetu-muted text-sm ml-2">
                            {new Date(payment.date).toLocaleDateString("en-US")}
                            {payment.is_extra && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Extra
                              </Badge>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPaymentId(payment.id);
                              setEditAmount(String(payment.amount));
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeletePayment(payment.id, payment.debt_id)
                            }
                            disabled={deletingId === payment.id}
                            className="text-budgetu-muted hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-budgetu-heading">
            All Debts & Loans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {debts.length === 0 ? (
            <p className="text-budgetu-muted text-sm">
              No debts or loans yet. Add one to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {debts.map((debt) => (
                <div
                  key={debt.id}
                  className={`flex items-center justify-between gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedDebtId === debt.id
                      ? "border-budgetu-accent bg-budgetu-accent/5"
                      : "border-border bg-[#f9fafb] hover:border-budgetu-accent/30"
                  }`}
                  onClick={() => {
                    router.push(`/dashboard/debt?debt=${debt.id}`);
                    setPayments([]);
                  }}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-budgetu-heading block truncate">
                      {debt.name}
                    </span>
                    <p className="text-xs text-budgetu-muted mt-0.5">
                      ${Number(debt.principal).toFixed(2)} owed
                      {debt.interest_rate > 0 && ` · ${debt.interest_rate}% APR`}
                    </p>
                  </div>
                  <div
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AddDebtPaymentDialog
                      debtId={debt.id}
                      debtName={debt.name}
                      monthlyPayment={Number(debt.monthly_payment)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DebtsPage({ initialDebts }: { initialDebts: Debt[] }) {
  return (
    <Suspense fallback={<p className="text-budgetu-muted">Loading...</p>}>
      <DebtsPageInner initialDebts={initialDebts} />
    </Suspense>
  );
}
