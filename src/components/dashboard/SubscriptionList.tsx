"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  setSubscriptionStatus,
  removeSubscriptionOverride,
  type DetectedSubscription,
} from "@/lib/subscriptions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Ban, RotateCcw, EyeOff, CreditCard } from "lucide-react";

export default function SubscriptionList({
  subscriptions: initial,
}: {
  subscriptions: DetectedSubscription[];
}) {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCancel(merchantKey: string) {
    setLoading(merchantKey);
    const supabase = createClient();
    const result = await setSubscriptionStatus(supabase, merchantKey, "canceled");
    if (result.ok) {
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.merchantKey === merchantKey ? { ...s, status: "canceled" as const } : s
        )
      );
      router.refresh();
    }
    setLoading(null);
  }

  async function handleIgnore(merchantKey: string) {
    setLoading(merchantKey);
    const supabase = createClient();
    const result = await setSubscriptionStatus(supabase, merchantKey, "ignored");
    if (result.ok) {
      setSubscriptions((prev) => prev.filter((s) => s.merchantKey !== merchantKey));
      router.refresh();
    }
    setLoading(null);
  }

  async function handleRestore(merchantKey: string) {
    setLoading(merchantKey);
    const supabase = createClient();
    const result = await removeSubscriptionOverride(supabase, merchantKey);
    if (result.ok) {
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.merchantKey === merchantKey ? { ...s, status: undefined } : s
        )
      );
      router.refresh();
    }
    setLoading(null);
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-10 pb-10 text-center space-y-2">
          <CreditCard className="h-10 w-10 mx-auto text-budgetu-muted" />
          <p className="font-medium text-budgetu-heading">No subscriptions detected</p>
          <p className="text-sm text-budgetu-muted max-w-sm mx-auto">
            When the same merchant appears in 3 or more different months, it shows
            up here so you can track or cancel it.
          </p>
        </CardContent>
      </Card>
    );
  }

  const active = subscriptions.filter((s) => s.status !== "canceled");
  const canceled = subscriptions.filter((s) => s.status === "canceled");

  const totalMonthly = active.reduce((sum, s) => sum + s.avgAmount, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-lg border border-border p-4 bg-budgetu-surface flex items-center justify-between">
        <div>
          <p className="text-sm text-budgetu-muted">Estimated monthly subscriptions</p>
          <p className="text-2xl font-bold text-budgetu-negative">
            -${totalMonthly.toFixed(2)}
          </p>
        </div>
        <p className="text-sm text-budgetu-muted">
          {active.length} active · {canceled.length} canceled
        </p>
      </div>

      {/* Active subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold text-budgetu-heading">
            Detected Subscriptions
          </CardTitle>
          <CardDescription>
            These merchants appeared in your expenses across 3 or more months.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {active.length === 0 ? (
            <p className="text-sm text-budgetu-muted py-4 text-center">
              No active subscriptions.
            </p>
          ) : (
            <div className="space-y-1">
              {active.map((s) => (
                <div
                  key={s.merchantKey}
                  className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-budgetu-heading truncate capitalize">
                      {s.displayName}
                    </p>
                    <p className="text-xs text-budgetu-muted">
                      Seen in {s.monthCount} months · last {s.recentDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-base font-semibold text-budgetu-negative">
                      ~${s.avgAmount.toFixed(2)}/mo
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loading === s.merchantKey}
                      onClick={() => handleCancel(s.merchantKey)}
                      className="text-budgetu-muted hover:text-budgetu-negative"
                      title="Mark as canceled"
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loading === s.merchantKey}
                      onClick={() => handleIgnore(s.merchantKey)}
                      className="text-budgetu-muted hover:text-budgetu-heading"
                      title="Ignore (hide from list)"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canceled subscriptions */}
      {canceled.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-budgetu-heading">
              Canceled
            </CardTitle>
            <CardDescription>
              These have been marked as canceled. Restore if they reappear.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {canceled.map((s) => (
                <div
                  key={s.merchantKey}
                  className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0 opacity-60"
                >
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-budgetu-muted shrink-0">
                      Canceled
                    </Badge>
                    <p className="text-sm font-medium text-budgetu-body truncate capitalize">
                      {s.displayName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-budgetu-muted">
                      ~${s.avgAmount.toFixed(2)}/mo
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loading === s.merchantKey}
                      onClick={() => handleRestore(s.merchantKey)}
                      className="text-budgetu-muted hover:text-budgetu-heading"
                      title="Restore subscription"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-budgetu-muted text-center">
        <EyeOff className="inline h-3 w-3 mr-1" />
        Ignored subscriptions are permanently hidden. Use Cancel to keep them visible.
      </p>
    </div>
  );
}
