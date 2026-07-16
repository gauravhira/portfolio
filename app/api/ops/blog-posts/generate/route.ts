import { NextRequest, NextResponse } from "next/server";
import { BLOG_POST_DESTINATIONS, type BlogPostDestination } from "@/lib/blog-types";

const WEBHOOK_TIMEOUT_MS = 120_000;

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.N8N_BLOG_DRAFT_WEBHOOK_URL;
  if (!webhookUrl || webhookUrl === "change-me") {
    return NextResponse.json({ error: "N8N_BLOG_DRAFT_WEBHOOK_URL is not configured" }, { status: 500 });
  }

  let body: { note?: string; destination?: BlogPostDestination };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const note = body.note?.trim();
  if (!note) {
    return NextResponse.json({ error: "Note is required" }, { status: 400 });
  }

  const destination =
    body.destination && BLOG_POST_DESTINATIONS.includes(body.destination) ? body.destination : "portfolio";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, destination }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `n8n webhook returned ${res.status}${text ? `: ${text}` : ""}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      { error: aborted ? "Generation timed out — check n8n for the run's status" : "Could not reach n8n webhook" },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
