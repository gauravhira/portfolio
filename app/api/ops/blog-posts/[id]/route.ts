import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { BlogPost, BlogPostStatus, BlogPostDestination } from "@/lib/blog-types";

const ALLOWED_STATUSES: BlogPostStatus[] = ["idea", "drafted", "scheduled", "published", "archived"];
const ALLOWED_DESTINATIONS: BlogPostDestination[] = ["portfolio", "autopost", "both"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ post: data });
}

type PatchBody = {
  title?: string;
  slug?: string;
  destination?: BlogPostDestination;
  status?: BlogPostStatus;
  body?: string;
  excerpt?: string;
  seo_title?: string;
  meta_description?: string;
  target_keyword?: string;
  cover_image_public_id?: string;
  tags?: string[];
  published_date?: string | null;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const update: Record<string, string | string[] | null> = {};

  if (body.title !== undefined) update.title = body.title;
  if (body.slug !== undefined) update.slug = body.slug;
  if (body.destination !== undefined) {
    if (!ALLOWED_DESTINATIONS.includes(body.destination)) {
      return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
    }
    update.destination = body.destination;
  }
  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (body.body !== undefined) update.body = body.body;
  if (body.excerpt !== undefined) update.excerpt = body.excerpt;
  if (body.seo_title !== undefined) update.seo_title = body.seo_title;
  if (body.meta_description !== undefined) update.meta_description = body.meta_description;
  if (body.target_keyword !== undefined) update.target_keyword = body.target_keyword;
  if (body.cover_image_public_id !== undefined) update.cover_image_public_id = body.cover_image_public_id;
  if (body.tags !== undefined) update.tags = body.tags;
  if (body.published_date !== undefined) update.published_date = body.published_date;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  // Publishing without an existing published_date stamps it now — a schedule
  // change alone (still "scheduled") should not touch published_date.
  if (update.status === "published" && body.published_date === undefined) {
    const { data: existing, error: fetchError } = await supabase
      .from("blog_posts")
      .select("published_date")
      .eq("id", id)
      .single<Pick<BlogPost, "published_date">>();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    if (!existing?.published_date) {
      update.published_date = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ post: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
