import { NextResponse } from "next/server";

export async function POST() {
  const webhookUrl = process.env.N8N_DRAFTING_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "N8N_DRAFTING_WEBHOOK_URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `n8n webhook returned ${res.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Drafting triggered" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to reach n8n webhook: ${message}` },
      { status: 502 }
    );
  }
}
