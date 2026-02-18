"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { exportAllData } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Sun, Moon, Upload, Download, LogOut } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function DashboardNav({
  displayName,
}: {
  displayName: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState("");
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleExport() {
    setExporting(true);
    setExportMsg("");
    const supabase = createClient();
    const result = await exportAllData(supabase);
    setExporting(false);
    if (result.ok) {
      setExportMsg("Exported successfully!");
      setTimeout(() => setExportMsg(""), 3000);
    } else {
      setExportMsg("Export failed.");
    }
  }

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/income", label: "Income" },
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

      {/* Desktop: user menu */}
      <div className="hidden md:flex items-center gap-3 shrink-0">
        {displayName ? (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-budgetu-body font-medium hover:text-budgetu-heading transition-colors px-2 py-1 rounded-lg hover:bg-budgetu-accent/10"
            >
              {displayName}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-budgetu-surface border border-border rounded-xl shadow-lg z-50 py-2">
                {/* Appearance */}
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs text-budgetu-muted mb-2 font-medium uppercase tracking-wide">
                    Appearance
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { if (theme !== "light") toggleTheme(); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        theme === "light"
                          ? "border-budgetu-accent bg-budgetu-accent/10 text-budgetu-accent"
                          : "border-border text-budgetu-muted hover:text-budgetu-body"
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </button>
                    <button
                      onClick={() => { if (theme !== "dark") toggleTheme(); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        theme === "dark"
                          ? "border-budgetu-accent bg-budgetu-accent/10 text-budgetu-accent"
                          : "border-border text-budgetu-muted hover:text-budgetu-body"
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </button>
                  </div>
                </div>

                {/* Import */}
                <Link
                  href="/dashboard/import"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-budgetu-body hover:bg-budgetu-accent/10 hover:text-budgetu-heading transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Upload className="w-4 h-4" />
                  Import Expenses
                </Link>

                {/* Export */}
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-budgetu-body hover:bg-budgetu-accent/10 hover:text-budgetu-heading transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? "Exporting..." : "Export All Data"}
                </button>

                {exportMsg && (
                  <p className="px-3 pb-1 text-xs text-budgetu-positive">{exportMsg}</p>
                )}

                {/* Log out */}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-budgetu-body hover:bg-budgetu-accent/10 hover:text-budgetu-heading transition-colors"
                    data-testid="logout-button"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            className="text-budgetu-body font-semibold"
            onClick={handleLogout}
            data-testid="logout-button"
          >
            Log out
          </Button>
        )}
      </div>

      {/* Mobile hamburger */}
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
              {/* Appearance */}
              <div className="px-4 pb-2">
                <p className="text-xs text-budgetu-muted mb-2 font-medium uppercase tracking-wide">
                  Appearance
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { if (theme !== "light") toggleTheme(); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      theme === "light"
                        ? "border-budgetu-accent bg-budgetu-accent/10 text-budgetu-accent"
                        : "border-border text-budgetu-muted hover:text-budgetu-body"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                  <button
                    onClick={() => { if (theme !== "dark") toggleTheme(); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      theme === "dark"
                        ? "border-budgetu-accent bg-budgetu-accent/10 text-budgetu-accent"
                        : "border-border text-budgetu-muted hover:text-budgetu-body"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                </div>
              </div>

              {/* Import */}
              <Link
                href="/dashboard/import"
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-budgetu-body hover:bg-budgetu-accent/10 hover:text-budgetu-heading rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Upload className="w-4 h-4" />
                Import Expenses
              </Link>

              {/* Export */}
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-budgetu-body hover:bg-budgetu-accent/10 hover:text-budgetu-heading rounded-lg transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? "Exporting..." : "Export All Data"}
              </button>

              {exportMsg && (
                <p className="px-4 text-xs text-budgetu-positive">{exportMsg}</p>
              )}

              {/* Log out */}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2.5 px-4 text-budgetu-body font-semibold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                data-testid="logout-button-mobile"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
