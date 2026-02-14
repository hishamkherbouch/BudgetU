"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function DashboardNav({
  displayName,
}: {
  displayName: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/expenses", label: "Expenses" },
    { href: "/dashboard/education", label: "Education" },
  ];

  return (
    <header className="flex items-center justify-between gap-6 pb-8 border-b border-border mb-10">
      <Link href="/dashboard" className="flex items-center gap-2 no-underline">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-budgetu-accent text-white text-xl font-bold shrink-0">
          $
        </span>
        <span className="text-budgetu-heading text-xl font-bold">BudgetU</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map(({ href, label }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`text-[0.9375rem] font-medium transition-colors ${
                isActive
                  ? "text-budgetu-heading"
                  : "text-budgetu-body hover:text-budgetu-heading"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        {displayName && (
          <span className="text-sm text-budgetu-body font-medium hidden sm:inline">
            {displayName}
          </span>
        )}
        <Button
          variant="ghost"
          className="text-budgetu-body font-semibold"
          onClick={handleLogout}
          data-testid="logout-button"
        >
          Log out
        </Button>
      </div>
    </header>
  );
}
