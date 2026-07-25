import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { PublicQuizQuestion, QuizQuestionRow } from "@/lib/quiz-types";

const QUESTIONS_PER_DAY = 18;

// Deterministic PRNG (mulberry32) seeded from a string, so "today's" shuffle
// is identical across every request today and different tomorrow.
function hashStringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let state = seed;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seedStr: string): T[] {
  const rng = mulberry32(hashStringToSeed(seedStr));
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function GET() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const supabase = getSupabaseServerClient();

  // Explicit order matters here: without it, Postgres doesn't guarantee row
  // order is stable across repeated calls to the same query, which would
  // silently break the seeded-shuffle's determinism (same seed, different
  // input order -> different permutation).
  const { data, error } = await supabase.from("quiz_questions").select("*").order("id", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allQuestions = (data ?? []) as QuizQuestionRow[];

  // A question shown earlier TODAY shouldn't rank any differently than a
  // question that's never been shown — otherwise a page refresh later in
  // the day would see today's own updates and select a different set.
  // Only genuinely-past last_shown_at values count toward recency.
  function effectiveLastShownAt(lastShownAt: string | null): number {
    if (!lastShownAt) return -Infinity;
    if (lastShownAt.slice(0, 10) === todayStr) return -Infinity;
    return new Date(lastShownAt).getTime();
  }

  // Shuffle first (seeded by today's date), then a STABLE sort by recency —
  // ties (mostly nulls / today's own picks) keep the seeded shuffle order,
  // so the same date always reproduces the same order, and a new date
  // reproduces a different one.
  const shuffled = seededShuffle(allQuestions, todayStr);
  const sorted = [...shuffled].sort(
    (a, b) => effectiveLastShownAt(a.last_shown_at) - effectiveLastShownAt(b.last_shown_at)
  );

  const byTopic = new Map<string, QuizQuestionRow[]>();
  for (const q of sorted) {
    if (!byTopic.has(q.topic)) byTopic.set(q.topic, []);
    byTopic.get(q.topic)!.push(q);
  }
  const topics = [...byTopic.keys()];

  const selected: QuizQuestionRow[] = [];
  let round = 0;
  while (selected.length < QUESTIONS_PER_DAY) {
    let addedAny = false;
    for (const topic of topics) {
      if (selected.length >= QUESTIONS_PER_DAY) break;
      const bucket = byTopic.get(topic)!;
      if (round < bucket.length) {
        selected.push(bucket[round]);
        addedAny = true;
      }
    }
    round += 1;
    if (!addedAny) break;
  }

  const nowIso = new Date().toISOString();
  const ids = selected.map((q) => q.id);
  if (ids.length > 0) {
    const { error: updateError } = await supabase
      .from("quiz_questions")
      .update({ last_shown_at: nowIso })
      .in("id", ids);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  const publicQuestions: PublicQuizQuestion[] = selected.map((q) => ({
    id: q.id,
    topic: q.topic,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
  }));

  return NextResponse.json({ date: todayStr, questions: publicQuestions });
}
