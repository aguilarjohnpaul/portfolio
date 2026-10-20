// Pure scoring functions for the scorecard (spec §6.3).
// Used by the browser and by functions/api/scorecard.ts, so no imports here.

export type StageId = 'referred' | 'hired' | 'again';
export const STAGE_ORDER: StageId[] = ['referred', 'hired', 'again'];

export interface Option { label: string; score: number }
export interface Question { id: number; stage: StageId; text: string; fix: string; options?: Option[] }
export interface Band { min: number; max: number; name: string; slug: string; meaning: string }
export interface ScorecardData {
  standard_options: Option[];
  questions: Question[];
  bands: Band[];
}

export type StageScores = Record<StageId, number>;
export interface Result {
  total: number;
  stages: StageScores;
  band: Band;
  weakestStage: StageId;
  onScreenFix: Question;
  topFixes: Question[];
}

export const MAX_PER_QUESTION = 3;

export function optionsFor(q: Question, data: ScorecardData): Option[] {
  return q.options ?? data.standard_options;
}

/** True when answers has one allowed score per question. */
export function isValidAnswers(answers: unknown, data: ScorecardData): answers is number[] {
  return (
    Array.isArray(answers) &&
    answers.length === data.questions.length &&
    answers.every((a, i) =>
      Number.isInteger(a) && optionsFor(data.questions[i], data).some((o) => o.score === a),
    )
  );
}

export function stageScores(answers: number[], data: ScorecardData): StageScores {
  const out = {} as StageScores;
  for (const stage of STAGE_ORDER) {
    const idx = data.questions.map((q, i) => (q.stage === stage ? i : -1)).filter((i) => i >= 0);
    const sum = idx.reduce((s, i) => s + answers[i], 0);
    out[stage] = Math.round((sum / (idx.length * MAX_PER_QUESTION)) * 100);
  }
  return out;
}

export function totalScore(answers: number[]): number {
  const sum = answers.reduce((s, a) => s + a, 0);
  return Math.round((sum / (answers.length * MAX_PER_QUESTION)) * 100);
}

/** Lowest stage score. Ties go to the earlier stage. */
export function weakestStage(stages: StageScores): StageId {
  return STAGE_ORDER.reduce((low, s) => (stages[s] < stages[low] ? s : low), STAGE_ORDER[0]);
}

export function bandFor(total: number, bands: Band[]): Band {
  const band = bands.find((b) => total >= b.min && total <= b.max);
  if (!band) throw new Error(`No band covers score ${total}`);
  return band;
}

/** Lowest-scoring question in the stage. Ties go to the earlier question. */
export function onScreenFix(answers: number[], data: ScorecardData, stage: StageId): Question {
  let best = -1;
  data.questions.forEach((q, i) => {
    if (q.stage === stage && (best < 0 || answers[i] < answers[best])) best = i;
  });
  return data.questions[best];
}

/**
 * Questions scoring 1 or less, by score then question order, first 3.
 * If fewer than 3, fill with score-2 questions from the weakest stage.
 */
export function topFixes(answers: number[], data: ScorecardData, stage: StageId): Question[] {
  const indexes = data.questions.map((_, i) => i);
  const low = indexes.filter((i) => answers[i] <= 1).sort((a, b) => answers[a] - answers[b] || a - b);
  const fill = indexes.filter((i) => answers[i] === 2 && data.questions[i].stage === stage);
  return [...low, ...fill].slice(0, 3).map((i) => data.questions[i]);
}

export function computeResult(answers: number[], data: ScorecardData): Result {
  const stages = stageScores(answers, data);
  const total = totalScore(answers);
  const weakest = weakestStage(stages);
  return {
    total,
    stages,
    band: bandFor(total, data.bands),
    weakestStage: weakest,
    onScreenFix: onScreenFix(answers, data, weakest),
    topFixes: topFixes(answers, data, weakest),
  };
}
