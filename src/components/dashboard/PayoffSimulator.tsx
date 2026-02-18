"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Debt, DebtPayment } from "@/lib/types";
import { calculatePayoff, formatPayoffDate, formatMonths } from "@/lib/payoff";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, TrendingDown, Calendar, DollarSign, Info } from "lucide-react";

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-1 ${
        highlight
          ? "border-budgetu-accent bg-budgetu-accent/5"
          : "border-border bg-budgetu-surface-alt"
      }`}
    >
      <span className="text-xs text-budgetu-muted uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold ${highlight ? "text-budgetu-accent" : "text-budgetu-heading"}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-budgetu-muted">{sub}</span>}
    </div>
  );
}

export default function PayoffSimulator({
  debt,
  payments,
}: {
  debt: Debt;
  payments: DebtPayment[];
}) {
  const [extraPayment, setExtraPayment] = useState("0");

  const basePayment = Number(debt.monthly_payment);
  const principal = Number(debt.principal);
  const rate = Number(debt.interest_rate);

  const baseResult = useMemo(
    () => calculatePayoff(principal, rate, basePayment),
    [principal, rate, basePayment]
  );

  const extra = parseFloat(extraPayment) || 0;
  const boostedResult = useMemo(
    () => (extra > 0 ? calculatePayoff(principal, rate, basePayment + extra) : null),
    [principal, rate, basePayment, extra]
  );

  const totalPaid = payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link href="/dashboard/debt">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Debt & Loans
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-budgetu-heading">{debt.name}</h1>
          <p className="text-budgetu-muted text-sm mt-1">
            Payoff Simulator · {debt.debt_type.replace("_", " ")}
          </p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto">
          {rate}% APR
        </Badge>
      </div>

      {/* Current snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Balance Owed"
          value={`$${principal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          highlight
        />
        <StatCard
          label="Monthly Payment"
          value={`$${basePayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
        />
        <StatCard
          label="Interest Rate"
          value={`${rate}%`}
          sub="Annual (APR)"
        />
        <StatCard
          label="Total Paid (to date)"
          value={`$${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${payments.length} payment${payments.length !== 1 ? "s" : ""}`}
        />
      </div>

      {/* Base payoff projection */}
      {baseResult ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-budgetu-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-budgetu-accent" />
              Payoff Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-budgetu-surface-alt border border-border p-3">
                <p className="text-xs text-budgetu-muted mb-1">Payoff Date</p>
                <p className="text-lg font-bold text-budgetu-heading">
                  {formatPayoffDate(baseResult.payoffDate)}
                </p>
                <p className="text-xs text-budgetu-muted">{formatMonths(baseResult.months)} remaining</p>
              </div>
              <div className="rounded-lg bg-budgetu-surface-alt border border-border p-3">
                <p className="text-xs text-budgetu-muted mb-1">Total You&apos;ll Pay</p>
                <p className="text-lg font-bold text-budgetu-heading">
                  ${baseResult.totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-budgetu-muted">principal + interest</p>
              </div>
              <div className="rounded-lg bg-budgetu-surface-alt border border-border p-3">
                <p className="text-xs text-budgetu-muted mb-1">Total Interest Cost</p>
                <p className="text-lg font-bold text-destructive">
                  ${baseResult.totalInterest.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-budgetu-muted">cost of borrowing</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-budgetu-muted text-sm flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              Your monthly payment doesn&apos;t cover the monthly interest. Increase your payment to pay off this debt.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Extra payment simulator */}
      {baseResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-budgetu-heading flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-green-500" />
              What if I pay extra each month?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 max-w-xs">
                <label htmlFor="extra" className="text-sm text-budgetu-muted mb-1.5 block">
                  Extra monthly payment ($)
                </label>
                <Input
                  id="extra"
                  type="number"
                  min="0"
                  step="10"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(e.target.value)}
                  placeholder="0"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExtraPayment("0")}
                className="mb-0.5"
              >
                Reset
              </Button>
            </div>

            {boostedResult ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-green-500/5 border border-green-500/30 p-3">
                  <p className="text-xs text-budgetu-muted mb-1">New Payoff Date</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatPayoffDate(boostedResult.payoffDate)}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {formatMonths(baseResult.months - boostedResult.months)} sooner
                  </p>
                </div>
                <div className="rounded-lg bg-green-500/5 border border-green-500/30 p-3">
                  <p className="text-xs text-budgetu-muted mb-1">New Total</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${boostedResult.totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    save ${(baseResult.totalPaid - boostedResult.totalPaid).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-lg bg-green-500/5 border border-green-500/30 p-3">
                  <p className="text-xs text-budgetu-muted mb-1">Interest Saved</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${(baseResult.totalInterest - boostedResult.totalInterest).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-budgetu-muted">
                    from ${baseResult.totalInterest.toLocaleString("en-US", { minimumFractionDigits: 2 })} → ${boostedResult.totalInterest.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ) : (
              extra > 0 && (
                <p className="text-budgetu-muted text-sm">
                  Adding ${extra}/mo still doesn&apos;t cover the interest. Try a higher amount.
                </p>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-budgetu-heading flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-budgetu-accent" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-budgetu-muted text-sm">
              No payments recorded yet. Go to{" "}
              <Link href="/dashboard/debt" className="text-budgetu-accent underline underline-offset-2">
                Debt &amp; Loans
              </Link>{" "}
              to record your first payment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-budgetu-muted border-b border-border">
                    <th className="text-left pb-2 font-medium">Date</th>
                    <th className="text-right pb-2 font-medium">Amount</th>
                    <th className="text-right pb-2 font-medium">Type</th>
                    {payments.some((p) => p.notes) && (
                      <th className="text-left pb-2 font-medium pl-4">Notes</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 text-budgetu-muted">
                        {new Date(p.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-2 text-right font-medium text-budgetu-heading">
                        ${Number(p.amount).toFixed(2)}
                      </td>
                      <td className="py-2 text-right">
                        {p.is_extra ? (
                          <Badge variant="secondary" className="text-xs">Extra</Badge>
                        ) : (
                          <span className="text-budgetu-muted text-xs">Regular</span>
                        )}
                      </td>
                      {payments.some((p) => p.notes) && (
                        <td className="py-2 pl-4 text-budgetu-muted text-xs">{p.notes ?? "—"}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border font-semibold">
                    <td className="pt-2 text-budgetu-muted text-xs">Total paid</td>
                    <td className="pt-2 text-right text-budgetu-heading">
                      ${totalPaid.toFixed(2)}
                    </td>
                    <td />
                    {payments.some((p) => p.notes) && <td />}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
