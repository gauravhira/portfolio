import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "ops_session";
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

function sign(secret: string, data: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

export function createSessionToken(): string {
  const secret = process.env.OPS_PASSWORD!;
  const exp = Date.now() + EXPIRY_MS;
  const sig = sign(secret, `ops|${exp}`);
  return `${exp}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  try {
    const secret = process.env.OPS_PASSWORD;
    if (!secret) return false;
    const dotIdx = token.indexOf(".");
    if (dotIdx === -1) return false;
    const expStr = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const exp = parseInt(expStr, 10);
    if (isNaN(exp) || exp < Date.now()) return false;
    const expected = sign(secret, `ops|${exp}`);
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || a.length === 0) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
