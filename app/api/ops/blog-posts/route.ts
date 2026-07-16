import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const destination = params.get("destination");

  const supabase = getSupabaseServerClient();
  let query = supabase.from("blog_posts").select("*").order("updated_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (destination && destination !== "all") query = query.eq("destination", destination);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}
