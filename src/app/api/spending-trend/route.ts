import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMonthlyTrendData } from "@/lib/dashboard";

export async function GET(request: NextRequest) {
  const monthsParam = request.nextUrl.searchParams.get("months");
  const months = Math.min(12, Math.max(1, Number(monthsParam) || 3));

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const result = await getMonthlyTrendData(supabase, months);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.value);
}
