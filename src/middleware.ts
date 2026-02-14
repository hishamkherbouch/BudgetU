import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
  const isProtected =
    path.startsWith("/dashboard") || path.startsWith("/onboarding");

  // Authenticated user on auth pages → redirect to dashboard
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated user on /signup or /login → redirect to home with auth modal
  if (!user && path === "/signup") {
    return NextResponse.redirect(new URL("/?auth=signup", request.url));
  }
  if (!user && path === "/login") {
    return NextResponse.redirect(new URL("/?auth=login", request.url));
  }

  // Unauthenticated user on protected pages → redirect to login (home with auth modal)
  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/?auth=login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login", "/signup"],
};
