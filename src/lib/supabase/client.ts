import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.error(
    "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Add them to .env.local and restart the dev server (npm run dev)."
  );
}

export function createClient() {
  return createBrowserClient(
    supabaseUrl ?? "",
    supabaseAnonKey ?? ""
  );
}
