const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface AttemptWindow {
  count: number;
  windowStart: number;
}

// In-memory only: this Map lives in the Node process, so it resets on every
// server restart/redeploy and is NOT shared across parallel instances. That's
// fine for a single-instance internal tool, but if this ever runs on
// multi-instance/serverless infra (or needs to survive redeploys), swap this
// for a shared store like Vercel KV or Upstash Redis.
const attempts = new Map<string, AttemptWindow>();

export function isRateLimited(ip: string): boolean {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.windowStart > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

export function resetAttempts(ip: string): void {
  attempts.delete(ip);
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
