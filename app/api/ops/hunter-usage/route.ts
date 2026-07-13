import { NextResponse } from "next/server";

interface HunterQuota {
  used: number;
  available: number;
}

interface HunterAccountData {
  reset_date?: string;
  requests?: {
    searches?: HunterQuota;
    verifications?: HunterQuota;
  };
  calls?: HunterQuota;
}

export async function GET() {
  if (!process.env.HUNTER_API_KEY) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let json: { data?: HunterAccountData; errors?: { details?: string }[] };
  try {
    const res = await fetch(
      `https://api.hunter.io/v2/account?api_key=${process.env.HUNTER_API_KEY}`
    );
    json = await res.json();
    if (!res.ok) {
      const message = json.errors?.[0]?.details ?? "Hunter API request failed";
      return NextResponse.json({ error: message }, { status: res.status });
    }
  } catch {
    return NextResponse.json({ error: "Failed to reach Hunter API" }, { status: 502 });
  }

  const data = json.data;
  const searches = data?.requests?.searches ?? null;
  const verifications = data?.requests?.verifications ?? null;
  const calls = data?.calls ?? null;

  return NextResponse.json({
    searches: searches
      ? { ...searches, remaining: searches.available - searches.used }
      : null,
    verifications: verifications
      ? { ...verifications, remaining: verifications.available - verifications.used }
      : null,
    calls: calls ? { ...calls, remaining: calls.available - calls.used } : null,
    reset_date: data?.reset_date ?? null,
  });
}
