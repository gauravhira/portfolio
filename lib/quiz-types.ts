export type QuizDifficulty = "easy" | "medium" | "hard";

export interface QuizQuestionRow {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  source_title: string | null;
  source_url: string | null;
  difficulty: QuizDifficulty;
  last_shown_at: string | null;
  created_at: string;
}

// What /api/study/daily-quiz returns per question — deliberately omits
// correct_index/explanation/source_* so answers can't be read from the
// network tab before submitting.
export interface PublicQuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  difficulty: QuizDifficulty;
}

export interface SubmitAnswerResult {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
}

export interface TopicStat {
  topic: string;
  correct: number;
  total: number;
  accuracy: number;
}

// A single quiz_attempts row for today, joined with its question's topic —
// used by /study to detect an already-complete day and to resume mid-quiz.
export interface TodayAttempt {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  topic: string;
}
