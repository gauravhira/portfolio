import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { QuizQuestionRow, SubmitAnswerResult } from "@/lib/quiz-types";

export async function POST(request: NextRequest) {
  let body: { questionId?: string; selectedIndex?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { questionId, selectedIndex } = body;
  if (!questionId || typeof selectedIndex !== "number") {
    return NextResponse.json({ error: "questionId and selectedIndex are required" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { data: question, error: fetchError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("id", questionId)
    .single<QuizQuestionRow>();

  if (fetchError || !question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const isCorrect = selectedIndex === question.correct_index;
  const todayStr = new Date().toISOString().slice(0, 10);

  const { error: insertError } = await supabase.from("quiz_attempts").insert({
    question_id: question.id,
    quiz_date: todayStr,
    selected_index: selectedIndex,
    is_correct: isCorrect,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const result: SubmitAnswerResult = {
    isCorrect,
    correctIndex: question.correct_index,
    explanation: question.explanation,
    sourceTitle: question.source_title,
    sourceUrl: question.source_url,
  };

  return NextResponse.json(result);
}
