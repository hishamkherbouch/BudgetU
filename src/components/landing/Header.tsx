"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/faq", label: "FAQ" },
  ];

  function openAuthModal(type: "signup" | "login") {
    router.push(`${pathname || "/"}?auth=${type}`);
  }

  return (
    <header className="flex items-center justify-between gap-4 pb-8 border-b border-border mb-10">
      <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-budgetu-accent text-white text-xl font-bold shrink-0">
          $
        </span>
        <span className="text-budgetu-heading text-xl font-bold">BudgetU</span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-budgetu-body text-[0.9375rem] font-medium hover:text-budgetu-heading transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Desktop auth buttons */}
      <div className="hidden md:flex items-center gap-3 shrink-0">
        <ThemeToggle />
        <Button
          variant="ghost"
          className="text-budgetu-body font-semibold"
          onClick={() => openAuthModal("login")}
        >
          Log in
        </Button>
        <Button
          className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white font-semibold"
          onClick={() => openAuthModal("signup")}
        >
          Sign up free
        </Button>
      </div>

      {/* Mobile hamburger button */}
      <button
        type="button"
        className="md:hidden p-2 rounded-lg text-budgetu-heading hover:bg-budgetu-accent/10 transition-colors"
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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          {/* Slide-in panel */}
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
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="py-3 px-4 rounded-lg text-budgetu-body font-medium hover:bg-budgetu-accent/10 hover:text-budgetu-heading transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-border flex flex-col gap-2">
              <div className="flex items-center justify-between px-4 mb-2">
                <span className="text-sm text-budgetu-body">Theme</span>
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                className="w-full justify-center text-budgetu-body font-semibold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("login");
                }}
              >
                Log in
              </Button>
              <Button
                className="w-full justify-center bg-budgetu-accent hover:bg-budgetu-accent-hover text-white font-semibold"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal("signup");
                }}
              >
                Sign up free
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
