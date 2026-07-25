import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { TodayAttempt } from "@/lib/quiz-types";

// Lets /study tell, on load, whether today's quiz is already fully attempted
// (and if partially attempted, which questions to skip on resume) without
// waiting for the user to click through the whole session.
export async function GET() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("question_id, selected_index, is_correct, quiz_questions(topic)")
    .eq("quiz_date", todayStr);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const attempts: TodayAttempt[] = (data ?? []).map((row) => {
    const related = row.quiz_questions as unknown as { topic: string } | { topic: string }[] | null;
    const topic = Array.isArray(related) ? related[0]?.topic : related?.topic;
    return {
      questionId: row.question_id as string,
      selectedIndex: row.selected_index as number,
      isCorrect: row.is_correct as boolean,
      topic: topic ?? "Unknown",
    };
  });

  return NextResponse.json({ date: todayStr, attempts });
}
