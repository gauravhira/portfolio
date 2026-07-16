import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/blog-queries";

const BASE_URL = "https://gauravhira.dev";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPublishedPosts();

  return [
    { url: BASE_URL, lastModified: new Date() },
    { url: `${BASE_URL}/blog`, lastModified: new Date() },
    ...posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at),
    })),
  ];
}
