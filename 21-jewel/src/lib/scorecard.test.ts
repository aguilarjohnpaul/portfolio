import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { bandFor, computeResult, isValidAnswers, maxPoints, topFixes, type ScorecardData } from './scorecard';

const data = parse(readFileSync(new URL('../content/scorecard.yaml', import.meta.url), 'utf8')) as ScorecardData;
const all = (n: number) => Array(12).fill(n) as number[];

describe('scorecard scoring (24 points)', () => {
  it('has 12 questions with 2/1/0 options and a 24-point max', () => {
    expect(data.questions).toHaveLength(12);
    for (const q of data.questions) expect(q.options.map((o) => o.score)).toEqual([2, 1, 0]);
    expect(maxPoints(data)).toBe(24);
  });

  it('all zero: 0 points, lowest band, first three fixes', () => {
    const r = computeResult(all(0), data);
    expect(r.points).toBe(0);
    expect(r.max).toBe(24);
    expect(r.band.slug).toBe('losing-work');
    expect(r.topFixes.map((q) => q.id)).toEqual([1, 2, 3]);
  });

  it('perfect score: 24 points, top band, no fixes', () => {
    const r = computeResult(all(2), data);
    expect(r.points).toBe(24);
    expect(r.band.slug).toBe('built-to-win-work');
    expect(r.topFixes).toEqual([]);
  });

  it('band edges', () => {
    expect(bandFor(8, data.bands).slug).toBe('losing-work');
    expect(bandFor(9, data.bands).slug).toBe('leaking-calls');
    expect(bandFor(16, data.bands).slug).toBe('leaking-calls');
    expect(bandFor(17, data.bands).slug).toBe('built-to-win-work');
    expect(() => bandFor(25, data.bands)).toThrow();
  });

  it('fixes sort by score, then question order (tie-break)', () => {
    const s = all(2);
    s[11] = 0; s[2] = 1; s[6] = 0; s[0] = 1;
    expect(topFixes(s, data).map((q) => q.id)).toEqual([7, 12, 1]);
  });

  it('shows fewer than 3 fixes when fewer answers miss', () => {
    const s = all(2);
    s[9] = 1;
    const r = computeResult(s, data);
    expect(r.points).toBe(23);
    expect(r.topFixes.map((q) => q.id)).toEqual([10]);
  });

  it('only answers below 2 count as leaks', () => {
    const s = all(1);
    expect(computeResult(s, data).points).toBe(12);
    expect(topFixes(s, data).map((q) => q.id)).toEqual([1, 2, 3]);
  });

  it('validates the industry answer plus 12 scores', () => {
    expect(isValidAnswers(['sign-print', ...all(2)], data)).toBe(true);
    expect(isValidAnswers(['plumbing', ...all(2)], data)).toBe(false);
    expect(isValidAnswers(all(2), data)).toBe(false);
    expect(isValidAnswers(['hvac', ...all(3)], data)).toBe(false);
    expect(isValidAnswers(['hvac', ...all(2).slice(1)], data)).toBe(false);
    expect(isValidAnswers('x', data)).toBe(false);
  });
});
