import { NextResponse } from "next/server";
import { listPublishedPosts } from "@/lib/blog-queries";

export async function GET() {
  try {
    const posts = await listPublishedPosts();
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
