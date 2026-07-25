import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { TopicStat } from "@/lib/quiz-types";

// PostgREST has no server-side GROUP BY without a custom view/RPC (and this
// project only has PostgREST access, no direct DDL) — so we pull attempts
// joined to their question's topic via the FK relationship and aggregate here.
export async function GET() {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("is_correct, quiz_questions(topic)");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byTopic = new Map<string, { correct: number; total: number }>();
  for (const row of data ?? []) {
    const related = row.quiz_questions as unknown as { topic: string } | { topic: string }[] | null;
    const topic = Array.isArray(related) ? related[0]?.topic : related?.topic;
    if (!topic) continue;

    const entry = byTopic.get(topic) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (row.is_correct) entry.correct += 1;
    byTopic.set(topic, entry);
  }

  const stats: TopicStat[] = [...byTopic.entries()]
    .map(([topic, { correct, total }]) => ({
      topic,
      correct,
      total,
      accuracy: total > 0 ? correct / total : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  return NextResponse.json({ stats });
}
