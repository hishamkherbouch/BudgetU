"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // If email confirmation is required, Supabase returns a user but no session
      if (data?.user && !data.session) {
        setError(
          "Check your email for a confirmation link, then come back and log in."
        );
        setLoading(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      const isFailedToFetch = message.toLowerCase().includes("failed to fetch");
      setError(
        isFailedToFetch
          ? "Could not reach Supabase. Check your internet connection, that NEXT_PUBLIC_SUPABASE_URL in .env.local is correct (e.g. https://xxxxx.supabase.co), and restart the dev server. If your project is on the free tier, ensure it isn’t paused in the Supabase dashboard."
          : message
      );
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-budgetu-heading">
          Create your account
        </CardTitle>
        <CardDescription>Start budgeting smarter today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-budgetu-heading">
              Display name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Alex"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              data-testid="signup-name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-budgetu-heading">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="signup-email"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-budgetu-heading">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              data-testid="signup-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" data-testid="signup-error">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
            disabled={loading}
            data-testid="signup-submit"
          >
            {loading ? "Creating account..." : "Sign up free"}
          </Button>

          <p className="text-center text-sm text-budgetu-body">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-budgetu-accent hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
