import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import {
  computeResult, isValidAnswers, optionsFor, topFixes, weakestStage, type ScorecardData,
} from './scorecard';

const data = parse(readFileSync(new URL('../content/scorecard.yaml', import.meta.url), 'utf8')) as ScorecardData;
const all = (n: number) => Array(12).fill(n);

describe('scorecard scoring', () => {
  it('all zero: score 0, lowest band, first stage weakest, first three fixes', () => {
    const r = computeResult(all(0), data);
    expect(r.total).toBe(0);
    expect(r.stages).toEqual({ referred: 0, hired: 0, again: 0 });
    expect(r.band.slug).toBe('running-on-luck');
    expect(r.weakestStage).toBe('referred');
    expect(r.onScreenFix.id).toBe(1);
    expect(r.topFixes.map((q) => q.id)).toEqual([1, 2, 3]);
  });

  it('all max: score 100, top band, no fixes needed', () => {
    const r = computeResult(all(3), data);
    expect(r.total).toBe(100);
    expect(r.stages).toEqual({ referred: 100, hired: 100, again: 100 });
    expect(r.band.slug).toBe('built-to-be-referred');
    expect(r.topFixes).toEqual([]);
  });

  it('ties between stages go to the earlier stage', () => {
    expect(weakestStage({ referred: 50, hired: 50, again: 50 })).toBe('referred');
    expect(weakestStage({ referred: 80, hired: 40, again: 40 })).toBe('hired');
    expect(weakestStage({ referred: 80, hired: 90, again: 40 })).toBe('again');
  });

  it('ties between questions go to the earlier question', () => {
    const a = all(3);
    a[9] = 1; a[10] = 1; // Q10 and Q11 tie in "again"
    const r = computeResult(a, data);
    expect(r.weakestStage).toBe('again');
    expect(r.onScreenFix.id).toBe(10);
    expect(r.topFixes.map((q) => q.id)).toEqual([10, 11]);
  });

  it('Q5 uses its own options, scored 3 to 0', () => {
    const q5 = data.questions[4];
    const opts = optionsFor(q5, data);
    expect(opts.map((o) => o.label)).toEqual(['Within the hour', 'Same day', 'Within 1–2 days', 'Longer']);
    expect(opts.map((o) => o.score)).toEqual([3, 2, 1, 0]);
    const a = all(3);
    a[4] = opts.find((o) => o.label === 'Longer')!.score;
    const r = computeResult(a, data);
    expect(r.stages.hired).toBe(75);
    expect(r.weakestStage).toBe('hired');
    expect(r.onScreenFix.id).toBe(5);
  });

  it('top fixes sort by score, then question order', () => {
    const a = all(3);
    a[11] = 0; a[2] = 1; a[6] = 0; a[0] = 1;
    expect(computeResult(a, data).topFixes.map((q) => q.id)).toEqual([7, 12, 1]);
  });

  it('fills top fixes with score-2 questions from the weakest stage', () => {
    const a = all(3);
    a[5] = 1;            // Q6 in "hired" is the only low score
    a[6] = 2; a[7] = 2;  // Q7, Q8 in "hired" at 2
    a[0] = 2;            // Q1 at 2 is in another stage, so not used
    const r = computeResult(a, data);
    expect(r.weakestStage).toBe('hired');
    expect(r.topFixes.map((q) => q.id)).toEqual([6, 7, 8]);
  });

  it('fill rule stops when the weakest stage has no more score-2 questions', () => {
    const a = all(3);
    a[8] = 2; // Q9 in "again"
    const r = computeResult(a, data);
    expect(r.weakestStage).toBe('again');
    expect(topFixes(a, data, r.weakestStage).map((q) => q.id)).toEqual([9]);
  });

  it('rounds stage and total scores', () => {
    const a = all(0);
    a[0] = 1; // referred 1/12 = 8.33 → 8; total 1/36 = 2.78 → 3
    const r = computeResult(a, data);
    expect(r.stages.referred).toBe(8);
    expect(r.total).toBe(3);
  });

  it('band edges', () => {
    const a = all(1); // 12/36 = 33
    expect(computeResult(a, data).band.slug).toBe('running-on-luck');
    expect(computeResult([...all(2)], data).band.slug).toBe('working-but-leaking'); // 67
  });

  it('validates answers', () => {
    expect(isValidAnswers(all(2), data)).toBe(true);
    expect(isValidAnswers(all(4), data)).toBe(false);
    expect(isValidAnswers([1, 2], data)).toBe(false);
    expect(isValidAnswers('x', data)).toBe(false);
    expect(isValidAnswers([...all(2).slice(0, 11), 1.5], data)).toBe(false);
  });
});
