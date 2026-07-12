import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/ops-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const isOps = host.startsWith("ops.");

  // Block direct /ops/* access from the main domain
  if (!isOps && pathname.startsWith("/ops")) {
    return new Response("Not Found", { status: 404 });
  }

  if (isOps) {
    // Let API calls pass through without rewrite so they resolve normally
    if (!pathname.startsWith("/api/")) {
      const isPublic = pathname === "/" || pathname === "/login";

      if (!isPublic) {
        const token = request.cookies.get(SESSION_COOKIE)?.value;
        if (!token || !verifySessionToken(token)) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }

      // / → /ops/login, /anything → /ops/anything
      const rewritePath = pathname === "/" ? "/ops/login" : `/ops${pathname}`;
      return NextResponse.rewrite(new URL(rewritePath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)", "/"],
};
