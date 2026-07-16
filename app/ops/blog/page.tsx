"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BlogPost, BlogPostDestination, BlogPostStatus } from "@/lib/blog-types";
import OpsNav from "../OpsNav";

const STATUS_TABS: { label: string; value: BlogPostStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Idea", value: "idea" },
  { label: "Drafted", value: "drafted" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const DESTINATION_TABS: { label: string; value: BlogPostDestination | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Portfolio", value: "portfolio" },
  { label: "AutoPost", value: "autopost" },
  { label: "Both", value: "both" },
];

// Same pill convention as the leads dashboard — solid navy when active.
function pillClass(active: boolean) {
  return `px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
    active
      ? "bg-[var(--navy)] text-white border-[var(--navy)] font-medium"
      : "border-black/20 text-[var(--navy)] hover:border-[var(--navy)]"
  }`;
}

const DESTINATION_BADGE_LABEL: Record<BlogPostDestination, string> = {
  portfolio: "Portfolio",
  autopost: "AutoPost",
  both: "Both",
};

function DestinationBadge({ destination }: { destination: BlogPostDestination }) {
  return (
    <span
      className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-medium border uppercase tracking-wide"
      style={{
        background: "rgba(1,202,255,0.12)",
        borderColor: "rgba(1,202,255,0.35)",
        color: "var(--cyan2)",
      }}
    >
      {DESTINATION_BADGE_LABEL[destination] ?? destination}
    </span>
  );
}

const STATUS_BADGE_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  published: { bg: "rgba(1,202,255,0.12)", border: "rgba(1,202,255,0.35)", color: "var(--cyan2)" },
  scheduled: { bg: "rgba(218,133,11,0.12)", border: "rgba(218,133,11,0.35)", color: "var(--gold)" },
  drafted: { bg: "rgba(12,15,20,0.06)", border: "rgba(12,15,20,0.18)", color: "var(--navy)" },
  idea: { bg: "rgba(12,15,20,0.04)", border: "rgba(12,15,20,0.14)", color: "var(--muted)" },
  archived: { bg: "rgba(12,15,20,0.04)", border: "rgba(12,15,20,0.14)", color: "var(--muted)" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_BADGE_STYLES[status] ?? STATUS_BADGE_STYLES.idea;
  return (
    <span
      className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-medium border uppercase tracking-wide"
      style={{ background: style.bg, borderColor: style.border, color: style.color }}
    >
      {status}
    </span>
  );
}

function formatTimestamp(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OpsBlogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10 text-sm text-[var(--muted)]">
          Loading…
        </div>
      }
    >
      <OpsBlogContent />
    </Suspense>
  );
}

function OpsBlogContent() {
  const router = useRouter();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | "all">("all");
  const [destinationFilter, setDestinationFilter] = useState<BlogPostDestination | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(
    async (filters: { status: BlogPostStatus | "all"; destination: BlogPostDestination | "all" }) => {
      setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams();
        if (filters.status !== "all") qs.set("status", filters.status);
        if (filters.destination !== "all") qs.set("destination", filters.destination);
        const query = qs.toString();
        const res = await fetch(`/api/ops/blog-posts${query ? `?${query}` : ""}`);
        if (!res.ok) throw new Error("Failed to load posts");
        const data = await res.json();
        setPosts(data.posts ?? []);
      } catch {
        setError("Could not load blog posts");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPosts({ status: statusFilter, destination: destinationFilter });
  }, [statusFilter, destinationFilter, fetchPosts]);

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10">
      <OpsNav />
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl mb-1">Blog Posts</h1>
          <p className="text-sm text-[var(--muted)]">ops.gauravhira.dev · Content pipeline</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-sm text-[var(--navy)] border border-black/20 hover:border-[var(--navy)] rounded-full px-4 py-1.5 h-fit transition-colors"
        >
          Back to Leads
        </button>
      </div>

      <div className="sticky top-0 z-20 bg-[var(--cream)] pt-2 pb-3 mb-4 border-b border-black/[0.07] flex flex-row flex-nowrap md:flex-wrap items-start gap-x-8 gap-y-2 w-full overflow-x-auto md:overflow-visible">
        <div className="flex-shrink-0">
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)] mb-1.5">Status</p>
          <div className="flex gap-2 flex-nowrap md:flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={pillClass(statusFilter === tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0">
          <p className="text-[11px] uppercase tracking-wide text-[var(--muted)] mb-1.5">Destination</p>
          <div className="flex gap-2 flex-nowrap md:flex-wrap">
            {DESTINATION_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setDestinationFilter(tab.value)}
                className={pillClass(destinationFilter === tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--muted)] mb-4">
        Showing {posts.length} post{posts.length === 1 ? "" : "s"}
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-[var(--muted)] text-sm">Loading…</p>}
      {!loading && posts.length === 0 && (
        <p className="text-[var(--muted)] text-sm">No posts in this view.</p>
      )}

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.id}`}
            className="bg-white border border-black/[0.07] rounded-2xl p-6 hover:border-[var(--navy)]/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
              <div>
                <h2 className="font-serif text-lg leading-tight text-[var(--navy)]">{post.title}</h2>
                <p className="text-xs text-[var(--muted)]">/{post.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <DestinationBadge destination={post.destination} />
                <StatusBadge status={post.status} />
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)] mb-3">
              {post.target_keyword && <span>Keyword: {post.target_keyword}</span>}
              {post.word_count !== null && <span>{post.word_count} words</span>}
              <span>Updated {formatTimestamp(post.updated_at)}</span>
            </div>

            {post.excerpt && (
              <p className="text-sm text-[var(--navy)]/80 line-clamp-2">{post.excerpt}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
