import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPeriodOverviewData } from "@/lib/dashboard";

export async function GET(request: NextRequest) {
  const monthsParam = request.nextUrl.searchParams.get("months");
  const months = Number(monthsParam);

  if (months !== 3 && months !== 6 && months !== 12) {
    return NextResponse.json(
      { error: "months must be 3, 6, or 12" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const result = await getPeriodOverviewData(supabase, months);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.value);
}
