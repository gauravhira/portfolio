"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicQuizQuestion, SubmitAnswerResult, TopicStat } from "@/lib/quiz-types";

const NEEDS_REVIEW_THRESHOLD = 0.6;

function optionClass(
  index: number,
  selected: number | null,
  result: SubmitAnswerResult | null
) {
  const base = "w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors";

  if (!result) {
    return `${base} ${
      selected === index
        ? "bg-[var(--navy)] text-white border-[var(--navy)] font-medium"
        : "border-black/20 text-[var(--navy)] hover:border-[var(--navy)]"
    }`;
  }

  // After submitting: highlight the correct answer green, a wrong pick red,
  // everything else neutral.
  if (index === result.correctIndex) {
    return `${base} border-emerald-600 bg-emerald-50 text-emerald-800 font-medium`;
  }
  if (index === selected) {
    return `${base} border-red-300 bg-red-50 text-red-700`;
  }
  return `${base} border-black/10 text-[var(--muted)]`;
}

export default function StudyPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<PublicQuizQuestion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitAnswerResult | null>(null);
  const [score, setScore] = useState(0);

  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<TopicStat[] | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    fetch("/api/study/daily-quiz")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load today's quiz");
        return res.json();
      })
      .then((data) => setQuestions(data.questions ?? []))
      .catch(() => setError("Could not load today's quiz"))
      .finally(() => setLoading(false));
  }, []);

  async function submitAnswer() {
    if (selected === null || !questions) return;
    const question = questions[currentIndex];
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/study/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, selectedIndex: selected }),
      });
      if (!res.ok) throw new Error("Failed to submit answer");
      const data: SubmitAnswerResult = await res.json();
      setResult(data);
      if (data.isCorrect) setScore((s) => s + 1);
    } catch {
      setError("Could not submit answer — please retry");
    } finally {
      setSubmitting(false);
    }
  }

  async function loadStats() {
    setStatsLoading(true);
    setStatsError("");
    try {
      const res = await fetch("/api/study/stats");
      if (!res.ok) throw new Error("Failed to load stats");
      const data = await res.json();
      setStats(data.stats ?? []);
    } catch {
      setStatsError("Could not load topic stats");
    } finally {
      setStatsLoading(false);
    }
  }

  function nextQuestion() {
    if (!questions) return;
    setResult(null);
    setSelected(null);
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      loadStats();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  async function logout() {
    await fetch("/api/study/logout", { method: "POST" }).catch(() => {});
    router.push("/study/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10 text-sm text-[var(--muted)]">
        Loading today's quiz…
      </div>
    );
  }

  if (error && !questions) {
    return (
      <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10">
        <p className="text-[var(--muted)] text-sm">No questions available.</p>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10">
        <div className="max-w-[600px] mx-auto">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-2xl mb-1">Session complete</h1>
              <p className="text-sm text-[var(--muted)]">
                Score: {score} / {questions.length}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-[var(--navy)] border border-black/20 hover:border-[var(--navy)] rounded-full px-4 py-1.5 h-fit transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="bg-white border border-black/[0.07] rounded-2xl p-6">
            <h2 className="font-serif text-lg mb-4">Accuracy by topic (all time)</h2>
            {statsLoading && <p className="text-sm text-[var(--muted)]">Loading…</p>}
            {statsError && <p className="text-sm text-red-600">{statsError}</p>}
            {stats && stats.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No attempts recorded yet.</p>
            )}
            {stats && stats.length > 0 && (
              <div className="flex flex-col gap-2">
                {stats.map((s) => {
                  const needsReview = s.accuracy < NEEDS_REVIEW_THRESHOLD;
                  return (
                    <div
                      key={s.topic}
                      className="flex items-center justify-between gap-4 rounded-xl px-4 py-2.5 border"
                      style={
                        needsReview
                          ? {
                              background: "rgba(220,38,38,0.06)",
                              borderColor: "rgba(220,38,38,0.25)",
                            }
                          : {
                              background: "rgba(12,15,20,0.03)",
                              borderColor: "rgba(12,15,20,0.08)",
                            }
                      }
                    >
                      <div>
                        <p className="text-sm text-[var(--navy)] font-medium">{s.topic}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {s.correct}/{s.total} correct
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {needsReview && (
                          <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
                            Needs review
                          </span>
                        )}
                        <span className="font-serif text-lg text-[var(--navy)]">
                          {Math.round(s.accuracy * 100)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--navy)] px-6 py-10 md:px-10">
      <div className="max-w-[600px] mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl mb-1">Daily Study Quiz</h1>
            <p className="text-sm text-[var(--muted)]">
              Question {currentIndex + 1} of {questions.length} · Score {score}/{questions.length}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-[var(--navy)] border border-black/20 hover:border-[var(--navy)] rounded-full px-4 py-1.5 h-fit transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="w-full h-1.5 rounded-full bg-black/[0.06] mb-8 overflow-hidden">
          <div
            className="h-full bg-[var(--navy)] transition-all"
            style={{ width: `${((currentIndex + (result ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="bg-white border border-black/[0.07] rounded-2xl p-6">
          <p className="text-[11px] uppercase tracking-wide text-[var(--cyan2)] mb-2">{question.topic}</p>
          <h2 className="font-serif text-lg leading-snug text-[var(--navy)] mb-5 whitespace-pre-wrap">
            {question.question}
          </h2>

          <div className="flex flex-col gap-2.5 mb-5">
            {question.options.map((option, index) => (
              <button
                key={index}
                type="button"
                disabled={!!result}
                onClick={() => setSelected(index)}
                className={optionClass(index, selected, result)}
              >
                {option}
              </button>
            ))}
          </div>

          {!result ? (
            <button
              type="button"
              onClick={submitAnswer}
              disabled={selected === null || submitting}
              className="w-full rounded-full bg-[var(--navy)] text-white text-sm font-medium py-2.5 disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p
                className={`text-sm font-medium ${
                  result.isCorrect ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {result.isCorrect ? "Correct!" : "Not quite."}
              </p>
              <p className="text-sm text-[var(--navy)]/80 leading-relaxed">{result.explanation}</p>
              {!result.isCorrect && result.sourceUrl && (
                <a
                  href={result.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--cyan2)] hover:underline"
                >
                  Study this — {result.sourceTitle ?? "source"} ↗
                </a>
              )}
              <button
                type="button"
                onClick={nextQuestion}
                className="w-full rounded-full bg-[var(--navy)] text-white text-sm font-medium py-2.5 mt-2"
              >
                {currentIndex + 1 >= questions.length ? "Finish" : "Next question"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
