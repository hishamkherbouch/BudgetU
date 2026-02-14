import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-budgetu-bg flex flex-col items-center justify-center px-6">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <span className="text-budgetu-accent text-3xl font-bold">$</span>
        <span className="text-white text-2xl font-bold">BudgetU</span>
      </Link>
      <LoginForm />
    </div>
  );
}
