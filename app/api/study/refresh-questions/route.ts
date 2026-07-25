import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { QuizDifficulty } from "@/lib/quiz-types";

const LOOKBACK_DAYS = 30;
const MIN_ATTEMPTS_TO_QUALIFY = 5;
const MAX_TOPICS_TO_TARGET = 3;
const TOTAL_QUESTIONS = 10;
const HEAD_REQUEST_TIMEOUT_MS = 8000;

// Used only when no topic has enough attempts yet to judge accuracy.
const DEFAULT_FALLBACK_TOPICS = ["Closures", "REST API Design", "System Design Fundamentals"];

const GeneratedQuestion = z.object({
  topic: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correct_index: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
  source_title: z.string().min(1),
  source_url: z.string().min(1),
});
const GeneratedQuestionsResponse = z.object({
  questions: z.array(GeneratedQuestion),
});

type GeneratedQuestionT = z.infer<typeof GeneratedQuestion>;

async function computeWeakTopics(supabase: SupabaseClient): Promise<string[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - LOOKBACK_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("is_correct, quiz_questions(topic)")
    .gte("quiz_date", cutoffStr);

  if (error) throw new Error(error.message);

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

  const qualifying = [...byTopic.entries()]
    .filter(([, { total }]) => total >= MIN_ATTEMPTS_TO_QUALIFY)
    .map(([topic, { correct, total }]) => ({ topic, accuracy: correct / total }))
    .sort((a, b) => a.accuracy - b.accuracy);

  if (qualifying.length === 0) return DEFAULT_FALLBACK_TOPICS;
  return qualifying.slice(0, MAX_TOPICS_TO_TARGET).map((t) => t.topic);
}

// Spreads TOTAL_QUESTIONS as evenly as possible across however many topics
// were actually targeted (1-3), front-loading any remainder.
function splitCount(total: number, topics: number): number[] {
  const base = Math.floor(total / topics);
  const remainder = total % topics;
  return Array.from({ length: topics }, (_, i) => base + (i < remainder ? 1 : 0));
}

function isValidQuestionShape(q: GeneratedQuestionT, allowedTopics: Set<string>): boolean {
  if (!allowedTopics.has(q.topic)) return false;
  if (!q.question.trim() || !q.explanation.trim() || !q.source_title.trim()) return false;
  if (!Array.isArray(q.options) || q.options.length !== 4) return false;
  if (q.options.some((o) => !o.trim())) return false;
  if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== 4) return false;
  if (!Number.isInteger(q.correct_index) || q.correct_index < 0 || q.correct_index > 3) return false;
  try {
    const url = new URL(q.source_url);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  } catch {
    return false;
  }
  return true;
}

// Claude tends to put the correct option in the same slot (usually first)
// across a whole batch, since it writes the correct answer before the
// distractors. Shuffle per-question so the position isn't a giveaway.
function shuffleOptions(options: string[], correctIndex: number): { options: string[]; correct_index: number } {
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const shuffled = order.map((i) => options[i]);
  const newCorrectIndex = order.indexOf(correctIndex);
  return { options: shuffled, correct_index: newCorrectIndex };
}

async function sourceUrlIsReachable(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEAD_REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { method: "HEAD", signal: controller.signal, redirect: "follow" });
    return res.status === 200;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "change-me") {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured" }, { status: 500 });
  }

  const supabase = getSupabaseServerClient();

  let topicsTargeted: string[];
  try {
    topicsTargeted = await computeWeakTopics(supabase);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  // Existing question text per targeted topic, so the model avoids duplicating phrasing.
  const { data: existingRows, error: existingError } = await supabase
    .from("quiz_questions")
    .select("topic, question")
    .in("topic", topicsTargeted);
  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const existingByTopic = new Map<string, string[]>();
  for (const row of existingRows ?? []) {
    if (!existingByTopic.has(row.topic)) existingByTopic.set(row.topic, []);
    existingByTopic.get(row.topic)!.push(row.question);
  }

  const counts = splitCount(TOTAL_QUESTIONS, topicsTargeted.length);
  const topicBriefs = topicsTargeted
    .map((topic, i) => {
      const existing = existingByTopic.get(topic) ?? [];
      const existingList = existing.length
        ? `\nExisting questions on this topic — do not duplicate their phrasing:\n${existing
            .map((q) => `- ${q}`)
            .join("\n")}`
        : "";
      return `Topic "${topic}": write exactly ${counts[i]} question(s).${existingList}`;
    })
    .join("\n\n");

  const prompt = `You are writing multiple-choice interview-prep questions for a Node.js/React/AWS/systems-design skillset, in the same style and difficulty as an existing question bank.

Generate questions for these topics:

${topicBriefs}

Requirements for every question:
- Set "topic" to the exact topic string given above.
- 4 answer options, plausible distractors, exactly one correct (0-indexed "correct_index").
- A 2-3 sentence explanation of why the correct answer is right.
- Cite a REAL, official documentation source you are confident actually exists — MDN, nodejs.org, expressjs.com, an official IETF RFC, oauth.net, mongodb.com, postgresql.org, docs.aws.amazon.com, docs.nginx.com, pm2.keymetrics.io, docs.github.com, react.dev, reactnative.dev, docs.expo.dev, redis.io, lodash.com, or an equivalent official vendor/spec doc for the topic. Never a blog post, tutorial site, or a URL you are not confident resolves.
- Do not phrase a question the same way as any existing question listed above for that topic — write genuinely new questions, not paraphrases.

Return only the questions, matching the provided schema.`;

  const anthropic = new Anthropic();

  let questions: GeneratedQuestionT[];
  try {
    const response = await anthropic.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: prompt }],
      output_config: {
        format: zodOutputFormat(GeneratedQuestionsResponse),
      },
    });

    if (!response.parsed_output) {
      return NextResponse.json({ error: "Model did not return parseable output" }, { status: 502 });
    }
    questions = response.parsed_output.questions;
  } catch (err) {
    return NextResponse.json(
      { error: `Claude generation failed: ${(err as Error).message}` },
      { status: 502 }
    );
  }

  const allowedTopics = new Set(topicsTargeted);
  let skipped = 0;
  const toInsert: {
    topic: string;
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
    source_title: string;
    source_url: string;
    difficulty: QuizDifficulty;
  }[] = [];

  for (const q of questions) {
    if (!isValidQuestionShape(q, allowedTopics)) {
      skipped += 1;
      continue;
    }
    const reachable = await sourceUrlIsReachable(q.source_url);
    if (!reachable) {
      skipped += 1;
      continue;
    }
    const { options, correct_index } = shuffleOptions(q.options, q.correct_index);
    toInsert.push({
      topic: q.topic,
      question: q.question,
      options,
      correct_index,
      explanation: q.explanation,
      source_title: q.source_title,
      source_url: q.source_url,
      difficulty: "medium",
    });
  }

  let inserted = 0;
  if (toInsert.length > 0) {
    const { data: insertedRows, error: insertError } = await supabase
      .from("quiz_questions")
      .insert(toInsert)
      .select("id");
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    inserted = insertedRows?.length ?? 0;
  }

  return NextResponse.json({
    topicsTargeted,
    generated: questions.length,
    inserted,
    skipped,
  });
}
