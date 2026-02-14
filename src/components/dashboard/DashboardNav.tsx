"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function DashboardNav({
  displayName,
}: {
  displayName: string | null;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between gap-4 pb-6 border-b border-border mb-8">
      <Link href="/dashboard" className="flex items-center gap-2 no-underline">
        <span className="text-budgetu-accent text-2xl font-bold">$</span>
        <span className="text-budgetu-heading text-xl font-bold">BudgetU</span>
      </Link>

      <div className="flex items-center gap-4">
        {displayName && (
          <span className="text-sm text-budgetu-body font-medium">
            {displayName}
          </span>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          data-testid="logout-button"
        >
          Log out
        </Button>
      </div>
    </header>
  );
}
