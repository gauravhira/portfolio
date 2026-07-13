import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("business_type")
    .not("business_type", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const businessTypes = Array.from(
    new Set(
      (data ?? [])
        .map((row) => row.business_type as string)
        .map((v) => v.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  return NextResponse.json({ business_types: businessTypes });
}
