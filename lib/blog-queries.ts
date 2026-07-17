import { getSupabaseServerClient } from "./supabase-server";
import type { BlogPost } from "./blog-types";

// Public-facing reads always filter to published + portfolio-visible content —
// used by the /blog pages and /api/blog routes, and safe to call from a
// no-auth context since it can never surface drafts or AutoPost-only posts.
export async function listPublishedPosts(limit?: number): Promise<BlogPost[]> {
  const supabase = getSupabaseServerClient();
  let query = supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .in("destination", ["portfolio", "both"])
    .order("published_date", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .in("destination", ["portfolio", "both"])
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
