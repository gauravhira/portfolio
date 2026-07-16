import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPublishedPostBySlug } from "@/lib/blog-queries";
import { cloudinaryUrl } from "@/lib/cloudinary";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Post not found — Gaurav Hira" };

  const title = post.seo_title || post.title;
  const description = post.meta_description || post.excerpt || undefined;
  const image = cloudinaryUrl(post.cover_image_public_id);
  const url = `https://gauravhira.dev/blog/${post.slug}`;

  return {
    title: `${title} — Gaurav Hira`,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const date = formatDate(post.published_date);

  return (
    <article className="px-[5%] py-[60px]">
      <div className="max-w-[720px] mx-auto">
        <Link href="/blog" className="text-[13px] text-[var(--cyan2)] hover:underline mb-6 inline-block">
          ← Back to Blog
        </Link>

        <h1 className="font-serif text-[clamp(28px,4vw,42px)] leading-[1.15] tracking-[-1px] text-[var(--navy)] mb-3">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          {date && <span className="text-[12px] text-[var(--muted)]">{date}</span>}
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
        </div>

        <div className="prose-blog">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body ?? ""}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
