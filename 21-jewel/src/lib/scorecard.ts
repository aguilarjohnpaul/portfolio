// Pure scoring functions for the scorecard (Change 02 §4.4).
// Used by the browser and by the /api/scorecard Function, so no imports here.
//
// 12 scored questions, each with its own 3 options worth 2 / 1 / 0 points (24 max).
// Q0 ("What kind of business do you run?") is not scored; it only tags the lead.

export interface Option { label: string; score: number }
export interface Question { id: number; text: string; fix: string; options: Option[] }
export interface Band { min: number; max: number; name: string; slug: string; headline: string; body: string }
export interface IndustryQuestion { id: 0; text: string; options: { label: string; value: string }[] }
export interface ScorecardData {
  industry: IndustryQuestion;
  questions: Question[];
  bands: Band[];
}

export interface Result {
  points: number;
  max: number;
  band: Band;
  /** Up to 3 questions that scored below 2, lowest first, ties by question order. */
  topFixes: Question[];
}

/** Answers are [industryValue, score1, …, score12]. */
export type Answers = [string, ...number[]];

export const maxPoints = (data: ScorecardData) =>
  data.questions.reduce((s, q) => s + Math.max(...q.options.map((o) => o.score)), 0);

/** True when answers has a known industry value plus one allowed score per question. */
export function isValidAnswers(answers: unknown, data: ScorecardData): answers is Answers {
  if (!Array.isArray(answers) || answers.length !== data.questions.length + 1) return false;
  const [industry, ...scores] = answers;
  return (
    typeof industry === 'string' &&
    data.industry.options.some((o) => o.value === industry) &&
    scores.every((a, i) => Number.isInteger(a) && data.questions[i].options.some((o) => o.score === a))
  );
}

export const totalPoints = (scores: number[]) => scores.reduce((s, a) => s + a, 0);

export function bandFor(points: number, bands: Band[]): Band {
  const band = bands.find((b) => points >= b.min && points <= b.max);
  if (!band) throw new Error(`No band covers ${points} points`);
  return band;
}

/** Questions scoring below 2, by score then question order, first 3. Empty on a perfect score. */
export function topFixes(scores: number[], data: ScorecardData): Question[] {
  return data.questions
    .map((q, i) => ({ q, s: scores[i], i }))
    .filter((x) => x.s < 2)
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .slice(0, 3)
    .map((x) => x.q);
}

export function computeResult(scores: number[], data: ScorecardData): Result {
  const points = totalPoints(scores);
  return { points, max: maxPoints(data), band: bandFor(points, data.bands), topFixes: topFixes(scores, data) };
}
