export type BlogPostStatus = "idea" | "drafted" | "scheduled" | "published" | "archived";
export type BlogPostDestination = "portfolio" | "autopost" | "both";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  destination: BlogPostDestination;
  status: BlogPostStatus;
  body: string | null;
  excerpt: string | null;
  seo_title: string | null;
  meta_description: string | null;
  target_keyword: string | null;
  cover_image_public_id: string | null;
  tags: string[] | null;
  author: string;
  published_date: string | null;
  source_query: string | null;
  word_count: number | null;
  instagram_adapted: boolean;
  created_at: string;
  updated_at: string;
}
