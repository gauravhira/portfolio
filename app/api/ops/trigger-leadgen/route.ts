import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.N8N_LEADGEN_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "N8N_LEADGEN_WEBHOOK_URL is not configured" },
      { status: 500 }
    );
  }

  let body: {
    businessType?: string;
    locations?: string;
    keywords?: string;
    maxResults?: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.businessType || !body.locations) {
    return NextResponse.json(
      { error: "businessType and locations are required" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessType: body.businessType,
        locations: body.locations,
        keywords: body.keywords || "",
        maxResults: body.maxResults || 20,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `n8n webhook returned ${res.status}: ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Lead gen triggered" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to reach n8n webhook: ${message}` },
      { status: 502 }
    );
  }
}
