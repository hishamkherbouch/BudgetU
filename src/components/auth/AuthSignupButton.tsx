"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type AuthSignupButtonProps = React.ComponentProps<typeof Button>;

export default function AuthSignupButton({
  children,
  ...props
}: AuthSignupButtonProps) {
  const pathname = usePathname();
  const router = useRouter();

  function openSignup() {
    router.push(`${pathname || "/"}?auth=signup`);
  }

  return (
    <Button {...props} onClick={openSignup}>
      {children}
    </Button>
  );
}
