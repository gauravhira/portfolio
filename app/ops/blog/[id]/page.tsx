"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { BlogPost, BlogPostDestination, BlogPostStatus } from "@/lib/blog-types";
import OpsNav from "../../OpsNav";

const STATUS_OPTIONS: BlogPostStatus[] = ["idea", "drafted", "scheduled", "published", "archived"];
const DESTINATION_OPTIONS: BlogPostDestination[] = ["portfolio", "autopost", "both"];

type TextField =
  | "title"
  | "slug"
  | "excerpt"
  | "seo_title"
  | "meta_description"
  | "target_keyword"
  | "cover_image_public_id"
  | "body";
type FieldSaveStatus = "idle" | "saving" | "saved" | "error";

const TEXT_FIELDS: TextField[] = [
  "title",
  "slug",
  "excerpt",
  "seo_title",
  "meta_description",
  "target_keyword",
  "cover_image_public_id",
  "body",
];
const AUTOSAVE_DELAY_MS = 2500;
const SAVED_FADE_MS = 2000;

const fieldInputClass =
  "mt-1 w-full rounded-xl bg-black/[0.03] border border-black/[0.12] p-2 text-sm text-[var(--navy)] outline-none focus:border-[var(--navy)]";

function SaveStatusLabel({ status }: { status: FieldSaveStatus | undefined }) {
  if (!status || status === "idle") return null;
  if (status === "saving") return <span className="text-[var(--muted)] normal-case">Saving…</span>;
  if (status === "saved") return <span className="text-emerald-600 normal-case">Saved</span>;
  return <span className="text-red-600 normal-case">Failed to save</span>;
}

function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function OpsBlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [textValues, setTextValues] = useState<Record<TextField, string>>({
    title: "",
    slug: "",
    excerpt: "",
    seo_title: "",
    meta_description: "",
    target_keyword: "",
    cover_image_public_id: "",
    body: "",
  });
  const [tagsInput, setTagsInput] = useState("");
  const [statusValue, setStatusValue] = useState<BlogPostStatus>("idea");
  const [destinationValue, setDestinationValue] = useState<BlogPostDestination>("portfolio");
  const [publishedDate, setPublishedDate] = useState("");
  const [fieldSaveStatus, setFieldSaveStatus] = useState<Partial<Record<TextField, FieldSaveStatus>>>({});
  const [statusSaveStatus, setStatusSaveStatus] = useState<FieldSaveStatus>("idle");

  const timersRef = useRef<Partial<Record<TextField, ReturnType<typeof setTimeout>>>>({});
  const pendingRef = useRef<Partial<Record<TextField, string>>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(`/api/ops/blog-posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load post");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const p: BlogPost = data.post;
        setPost(p);
        setTextValues({
          title: p.title ?? "",
          slug: p.slug ?? "",
          excerpt: p.excerpt ?? "",
          seo_title: p.seo_title ?? "",
          meta_description: p.meta_description ?? "",
          target_keyword: p.target_keyword ?? "",
          cover_image_public_id: p.cover_image_public_id ?? "",
          body: p.body ?? "",
        });
        setTagsInput((p.tags ?? []).join(", "));
        setStatusValue(p.status);
        setDestinationValue(p.destination);
        setPublishedDate(toDateInputValue(p.published_date));
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this post");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function setFieldStatus(field: TextField, status: FieldSaveStatus) {
    setFieldSaveStatus((prev) => ({ ...prev, [field]: status }));
  }

  const flushField = useCallback(
    async (field: TextField) => {
      const value = pendingRef.current[field];
      if (value === undefined) return;

      if (timersRef.current[field]) {
        clearTimeout(timersRef.current[field]);
        delete timersRef.current[field];
      }

      setFieldStatus(field, "saving");
      try {
        const res = await fetch(`/api/ops/blog-posts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        });
        if (!res.ok) throw new Error("Save failed");
        const data = await res.json();
        setPost(data.post);

        if (pendingRef.current[field] === value) {
          delete pendingRef.current[field];
        }

        setFieldSaveStatus((prev) => (prev[field] === "saving" ? { ...prev, [field]: "saved" } : prev));
        setTimeout(() => {
          setFieldSaveStatus((prev) => (prev[field] === "saved" ? { ...prev, [field]: "idle" } : prev));
        }, SAVED_FADE_MS);
      } catch {
        setFieldStatus(field, "error");
      }
    },
    [id]
  );

  function scheduleAutosave(field: TextField, value: string) {
    pendingRef.current[field] = value;
    if (timersRef.current[field]) clearTimeout(timersRef.current[field]);
    timersRef.current[field] = setTimeout(() => flushField(field), AUTOSAVE_DELAY_MS);
  }

  function updateTextField(field: TextField, value: string) {
    setTextValues((prev) => ({ ...prev, [field]: value }));
    scheduleAutosave(field, value);
  }

  function flushFieldOnBlur(field: TextField) {
    if (pendingRef.current[field] !== undefined) flushField(field);
  }

  function saveTagsNow(nextInput: string) {
    const tags = nextInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    fetch(`/api/ops/blog-posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.post) setPost(data.post);
      })
      .catch(() => {});
  }

  async function updateStatus(next: BlogPostStatus) {
    setStatusValue(next);
    setStatusSaveStatus("saving");
    try {
      const res = await fetch(`/api/ops/blog-posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setPost(data.post);
      setPublishedDate(toDateInputValue(data.post.published_date));
      setStatusSaveStatus("saved");
      setTimeout(() => setStatusSaveStatus((s) => (s === "saved" ? "idle" : s)), SAVED_FADE_MS);
    } catch {
      setStatusSaveStatus("error");
    }
  }

  async function updateDestination(next: BlogPostDestination) {
    setDestinationValue(next);
    try {
      const res = await fetch(`/api/ops/blog-posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: next }),
      });
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
      }
    } catch {
      // best-effort; the dropdown UI already reflects intent
    }
  }

  async function updatePublishedDate(next: string) {
    setPublishedDate(next);
    const iso = next ? new Date(next).toISOString() : null;
    try {
      const res = await fetch(`/api/ops/blog-posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published_date: iso }),
      });
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
      }
    } catch {
      // best-effort
    }
  }

  useEffect(() => {
    function flushAllKeepalive() {
      TEXT_FIELDS.forEach((field) => {
        const value = pendingRef.current[field];
        if (value !== undefined) {
          fetch(`/api/ops/blog-posts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [field]: value }),
            keepalive: true,
          }).catch(() => {});
        }
      });
    }
    window.addEventListener("beforeunload", flushAllKeepalive);
    return () => {
      window.removeEventListener("beforeunload", flushAllKeepalive);
      flushAllKeepalive();
      Object.values(timersRef.current).forEach((t) => t && clearTimeout(t));
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10">
        <OpsNav />
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10">
        <OpsNav />
        <p className="text-red-600 text-sm mb-4">{error || "Post not found"}</p>
        <Link href="/blog" className="text-[var(--cyan2)] hover:underline text-sm">
          ← Back to Blog Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10">
      <OpsNav />

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <button
            type="button"
            onClick={() => router.push("/blog")}
            className="text-sm text-[var(--cyan2)] hover:underline mb-2"
          >
            ← Back to Blog Posts
          </button>
          <h1 className="font-serif text-2xl">{textValues.title || "Untitled post"}</h1>
        </div>

        <div className="flex items-end gap-3 flex-wrap">
          <label className="text-xs text-[var(--muted)]">
            <div className="flex items-center justify-between gap-3">
              <span>Status</span>
              <SaveStatusLabel status={statusSaveStatus} />
            </div>
            <select
              value={statusValue}
              onChange={(e) => updateStatus(e.target.value as BlogPostStatus)}
              className="mt-1 rounded-xl bg-white border border-black/20 px-3 py-1.5 text-sm text-[var(--navy)] outline-none focus:border-[var(--navy)]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-[var(--muted)]">
            <span>Destination</span>
            <select
              value={destinationValue}
              onChange={(e) => updateDestination(e.target.value as BlogPostDestination)}
              className="mt-1 rounded-xl bg-white border border-black/20 px-3 py-1.5 text-sm text-[var(--navy)] outline-none focus:border-[var(--navy)] block"
            >
              {DESTINATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-[var(--muted)]">
            <span>Published date</span>
            <input
              type="date"
              value={publishedDate}
              onChange={(e) => updatePublishedDate(e.target.value)}
              className="mt-1 rounded-xl bg-white border border-black/20 px-3 py-1.5 text-sm text-[var(--navy)] outline-none focus:border-[var(--navy)] block"
            />
          </label>
        </div>
      </div>

      <div className="bg-white border border-black/[0.07] rounded-2xl p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <label className="text-xs text-[var(--muted)]">
            <div className="flex items-center justify-between">
              <span>Title</span>
              <SaveStatusLabel status={fieldSaveStatus.title} />
            </div>
            <input
              type="text"
              value={textValues.title}
              onChange={(e) => updateTextField("title", e.target.value)}
              onBlur={() => flushFieldOnBlur("title")}
              className={fieldInputClass}
            />
          </label>

          <label className="text-xs text-[var(--muted)]">
            <div className="flex items-center justify-between">
              <span>Slug</span>
              <SaveStatusLabel status={fieldSaveStatus.slug} />
            </div>
            <input
              type="text"
              value={textValues.slug}
              onChange={(e) => updateTextField("slug", e.target.value)}
              onBlur={() => flushFieldOnBlur("slug")}
              className={fieldInputClass}
            />
          </label>

          <label className="text-xs text-[var(--muted)]">
            <div className="flex items-center justify-between">
              <span>SEO title</span>
              <SaveStatusLabel status={fieldSaveStatus.seo_title} />
            </div>
            <input
              type="text"
              value={textValues.seo_title}
              onChange={(e) => updateTextField("seo_title", e.target.value)}
              onBlur={() => flushFieldOnBlur("seo_title")}
              className={fieldInputClass}
            />
          </label>

          <label className="text-xs text-[var(--muted)]">
            <div className="flex items-center justify-between">
              <span>Target keyword</span>
              <SaveStatusLabel status={fieldSaveStatus.target_keyword} />
            </div>
            <input
              type="text"
              value={textValues.target_keyword}
              onChange={(e) => updateTextField("target_keyword", e.target.value)}
              onBlur={() => flushFieldOnBlur("target_keyword")}
              className={fieldInputClass}
            />
          </label>

          <label className="text-xs text-[var(--muted)] md:col-span-2">
            <div className="flex items-center justify-between">
              <span>Meta description</span>
              <SaveStatusLabel status={fieldSaveStatus.meta_description} />
            </div>
            <input
              type="text"
              value={textValues.meta_description}
              onChange={(e) => updateTextField("meta_description", e.target.value)}
              onBlur={() => flushFieldOnBlur("meta_description")}
              className={fieldInputClass}
            />
          </label>

          <label className="text-xs text-[var(--muted)] md:col-span-2">
            <span>Excerpt</span>
            <textarea
              value={textValues.excerpt}
              onChange={(e) => updateTextField("excerpt", e.target.value)}
              onBlur={() => flushFieldOnBlur("excerpt")}
              rows={2}
              className={fieldInputClass}
            />
            <div className="flex justify-end mt-1">
              <SaveStatusLabel status={fieldSaveStatus.excerpt} />
            </div>
          </label>

          <label className="text-xs text-[var(--muted)]">
            <span>Cover image public ID</span>
            <input
              type="text"
              value={textValues.cover_image_public_id}
              onChange={(e) => updateTextField("cover_image_public_id", e.target.value)}
              onBlur={() => flushFieldOnBlur("cover_image_public_id")}
              className={fieldInputClass}
            />
          </label>

          <label className="text-xs text-[var(--muted)]">
            <span>Tags (comma-separated)</span>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              onBlur={() => saveTagsNow(tagsInput)}
              placeholder="automation, small business, ai"
              className={fieldInputClass}
            />
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-black/[0.07] rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wide">Body (Markdown)</p>
            <SaveStatusLabel status={fieldSaveStatus.body} />
          </div>
          <textarea
            value={textValues.body}
            onChange={(e) => updateTextField("body", e.target.value)}
            onBlur={() => flushFieldOnBlur("body")}
            className={`${fieldInputClass} flex-1 min-h-[60vh] font-mono resize-none`}
          />
        </div>

        <div className="bg-white border border-black/[0.07] rounded-2xl p-6 overflow-y-auto max-h-[calc(60vh+4rem)]">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wide mb-3">Preview</p>
          <article className="prose-blog">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {textValues.body || "*Nothing to preview yet.*"}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
