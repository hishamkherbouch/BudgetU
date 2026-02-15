"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardNav({
  displayName,
}: {
  displayName: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/expenses", label: "Expenses" },
    { href: "/dashboard/debt", label: "Debt & Loans" },
    { href: "/dashboard/education", label: "Education" },
  ];

  return (
    <header className="flex items-center justify-between gap-4 pb-8 border-b border-border mb-10">
      <Link href="/dashboard" className="flex items-center gap-2 no-underline shrink-0">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-budgetu-accent text-white text-xl font-bold shrink-0">
          $
        </span>
        <span className="text-budgetu-heading text-xl font-bold">BudgetU</span>
      </Link>

      {/* Desktop nav */}
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

      {/* Desktop user & logout */}
      <div className="hidden md:flex items-center gap-3 shrink-0">
        {displayName && (
          <span className="text-sm text-budgetu-body font-medium">
            {displayName}
          </span>
        )}
        <ThemeToggle />
        <Button
          variant="ghost"
          className="text-budgetu-body font-semibold"
          onClick={handleLogout}
          data-testid="logout-button"
        >
          Log out
        </Button>
      </div>

      {/* Mobile hamburger button */}
      <button
        type="button"
        className="md:hidden p-2 rounded-lg text-budgetu-heading hover:bg-budgetu-accent/10 transition-colors shrink-0"
        onClick={() => setMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-[320px] bg-budgetu-surface shadow-xl flex flex-col p-6">
            <div className="flex justify-between items-center mb-8">
              <span className="text-budgetu-heading font-bold text-lg">Menu</span>
              <button
                type="button"
                className="p-2 rounded-lg text-budgetu-body hover:bg-budgetu-accent/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {displayName && (
              <p className="text-sm text-budgetu-body font-medium mb-4 px-4">
                {displayName}
              </p>
            )}
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => {
                const isActive =
                  href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                      isActive
                        ? "text-budgetu-heading bg-budgetu-accent/10"
                        : "text-budgetu-body hover:bg-budgetu-accent/10 hover:text-budgetu-heading"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 pt-6 border-t border-border space-y-2">
              <div className="flex items-center justify-between px-4">
                <span className="text-sm text-budgetu-body">Theme</span>
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                className="w-full justify-center text-budgetu-body font-semibold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                data-testid="logout-button-mobile"
              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
