import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/blog-queries";

// Otherwise this list is statically cached at build time with no way to pick
// up newly-published posts short of a full redeploy.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Gaurav Hira",
  description: "Notes on AI, automation, and building systems that ship.",
  openGraph: {
    title: "Blog — Gaurav Hira",
    description: "Notes on AI, automation, and building systems that ship.",
    url: "https://gauravhira.dev/blog",
    type: "website",
  },
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();

  return (
    <section className="px-[5%] py-[60px]">
      <div className="max-w-[900px] mx-auto">
        <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[var(--cyan2)] mb-3">Writing</p>
        <h1 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-1px] text-[var(--navy)] mb-10">
          Blog
        </h1>

        {posts.length === 0 && (
          <p className="text-[15px] text-[var(--muted)]">No posts published yet — check back soon.</p>
        )}

        <div className="flex flex-col gap-5">
          {posts.map((post) => {
            const date = formatDate(post.published_date);
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="hover-lift block bg-white rounded-2xl border border-black/[0.07] p-7"
              >
                <h2 className="font-serif text-[22px] text-[var(--navy)] tracking-[-0.3px] mb-2">
                  {post.title}
                </h2>
                {date && <p className="text-[12px] text-[var(--muted)] mb-3">{date}</p>}
                {post.excerpt && (
                  <p className="text-[14px] text-[var(--muted)] leading-[1.65] mb-4">{post.excerpt}</p>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-[6px]">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-[10px] py-[3px] rounded-lg text-[11px] font-medium border"
                        style={{
                          background: "rgba(12,15,20,0.04)",
                          borderColor: "rgba(12,15,20,0.08)",
                          color: "var(--navy)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
