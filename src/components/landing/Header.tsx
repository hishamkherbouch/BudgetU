import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="flex items-center justify-between gap-6 pb-8 border-b border-border mb-10">
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="text-budgetu-accent text-2xl font-bold">$</span>
        <span className="text-budgetu-heading text-xl font-bold">BudgetU</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-budgetu-body text-[0.9375rem] font-medium hover:text-budgetu-heading transition-colors">
          Features
        </a>
        <a href="#testimonials" className="text-budgetu-body text-[0.9375rem] font-medium hover:text-budgetu-heading transition-colors">
          Testimonials
        </a>
        <a href="#pricing" className="text-budgetu-body text-[0.9375rem] font-medium hover:text-budgetu-heading transition-colors">
          Pricing
        </a>
      </nav>

      <div className="flex items-center gap-3">
        <Button variant="ghost" className="text-budgetu-body font-semibold" asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white font-semibold" asChild>
          <Link href="/signup">Sign up free</Link>
        </Button>
      </div>
    </header>
  );
}
