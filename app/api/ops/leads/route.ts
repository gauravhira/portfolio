import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");

  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  query = status
    ? query.eq("status", status)
    : query.in("status", ["drafted", "approved"]);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads: data });
}
