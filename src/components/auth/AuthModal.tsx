"use client";

import { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import SignupForm from "./SignupForm";
import LoginForm from "./LoginForm";

function AuthModalInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = searchParams.get("auth");

  const isOpen = auth === "signup" || auth === "login";

  function handleOpenChange(open: boolean) {
    if (!open) {
      const url = new URL(pathname || "/", window.location.origin);
      searchParams.forEach((value, key) => {
        if (key !== "auth") url.searchParams.set(key, value);
      });
      router.push(url.pathname + (url.search || ""));
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {auth === "signup" && <SignupForm />}
        {auth === "login" && <LoginForm />}
      </DialogContent>
    </Dialog>
  );
}

export default function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalInner />
    </Suspense>
  );
}
