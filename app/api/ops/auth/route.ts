import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, SESSION_COOKIE } from "@/lib/ops-session";
import { getClientIp, isRateLimited, recordFailedAttempt, resetAttempts } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts, try again later" },
      { status: 429 }
    );
  }

  if (!process.env.OPS_PASSWORD) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let password: string;
  try {
    const body = await request.json();
    password = body.password;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!password || password !== process.env.OPS_PASSWORD) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  resetAttempts(ip);

  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60,
    sameSite: "strict",
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
