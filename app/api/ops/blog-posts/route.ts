import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { slugify } from "@/lib/slugify";
import { BLOG_POST_DESTINATIONS, type BlogPostDestination } from "@/lib/blog-types";
import type { SupabaseClient } from "@supabase/supabase-js";

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

async function uniqueSlug(supabase: SupabaseClient, base: string): Promise<string> {
  let slug = base;
  let suffix = 1;
  // Sequential collision check — fine at the write rate an ops tool sees.
  while (true) {
    const { data, error } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

export async function POST(request: NextRequest) {
  let body: { title?: string; destination?: BlogPostDestination } = {};
  try {
    body = await request.json();
  } catch {
    // empty body is fine — every field has a default
  }

  const title = body.title?.trim() || "Untitled Post";
  const destination =
    body.destination && BLOG_POST_DESTINATIONS.includes(body.destination) ? body.destination : "portfolio";

  const supabase = getSupabaseServerClient();
  try {
    const baseSlug = slugify(title) || "untitled-post";
    const slug = await uniqueSlug(supabase, baseSlug);

    const { data, error } = await supabase
      .from("blog_posts")
      .insert({ title, slug, destination, status: "idea" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
