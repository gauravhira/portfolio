import Link from "next/link";
import { listPublishedPosts } from "@/lib/blog-queries";
import { cloudinaryUrl } from "@/lib/cloudinary";
import BlogScrollRow from "./BlogScrollRow";

const POST_LIMIT = 8;
const EXCERPT_MAX = 110;

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Calls the shared query directly rather than self-fetching /api/blog — the
// same server-to-server pattern the /blog pages use; /api/blog itself still
// exists (with the new ?limit= param) for any client-side or external caller.
export default async function LatestBlogPosts() {
  const posts = await listPublishedPosts(POST_LIMIT);
  if (posts.length === 0) return null;

  const cards = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ? truncate(post.excerpt, EXCERPT_MAX) : null,
    date: formatDate(post.published_date),
    image: cloudinaryUrl(post.cover_image_public_id),
  }));

  return (
    <section className="bg-white px-[5%] py-[90px] border-t border-black/[0.07]">
      <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
        <div>
          <p className="text-[11px] font-medium tracking-[1.5px] uppercase text-[--cyan2] mb-3">
            Writing
          </p>
          <h2 className="font-serif text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-1px] text-[--navy]">
            Latest from the Blog
          </h2>
        </div>
        <Link
          href="/blog"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-full border border-black/20 text-[--navy] text-[13px] font-medium hover:border-[--navy] transition-all duration-200 hover:-translate-y-[1px]"
        >
          View all posts →
        </Link>
      </div>

      <BlogScrollRow cards={cards} />

      <Link
        href="/blog"
        className="md:hidden mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-full border border-black/20 text-[--navy] text-[13px] font-medium"
      >
        View all posts →
      </Link>
    </section>
  );
}
