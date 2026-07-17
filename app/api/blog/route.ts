import { NextRequest, NextResponse } from "next/server";
import { listPublishedPosts } from "@/lib/blog-queries";

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsedLimit = limitParam ? parseInt(limitParam, 10) : undefined;
  const limit = parsedLimit && parsedLimit > 0 ? parsedLimit : undefined;

  try {
    const posts = await listPublishedPosts(limit);
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
