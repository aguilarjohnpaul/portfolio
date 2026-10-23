// Scorecard behavior: one page, three states (intro, questions, result + email).
// Screen 0 is the unscored business-type question; screens 1–12 are scored 2 / 1 / 0.
// Progress is kept in sessionStorage so a refresh doesn't lose answers.
import { computeResult, type ScorecardData } from '../lib/scorecard';
import { heroVariant, track } from '../lib/analytics';
import { loadTurnstile, type TurnstileHandle } from './turnstile';

type Step = 'intro' | 'questions' | 'result';
type Answer = string | number | null;
interface State { step: Step; index: number; answers: Answer[]; sent: boolean; completed: boolean }
interface Data extends ScorecardData { errors: Record<string, string> }

const KEY = 'scorecard-v2';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => [...root.querySelectorAll<T>(sel)];

function fresh(n: number): State {
  return { step: 'intro', index: 0, answers: Array(n).fill(null), sent: false, completed: false };
}

function load(n: number): State {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as State | null;
    if (s && Array.isArray(s.answers) && s.answers.length === n) return s;
  } catch {}
  return fresh(n);
}

function source(): string {
  try {
    if (!document.referrer) return '(direct)';
    const r = new URL(document.referrer);
    return r.origin === location.origin ? r.pathname : r.hostname;
  } catch { return '(unknown)'; }
}

export function initScorecard() {
  const found = document.querySelector<HTMLElement>('[data-scorecard]');
  if (!found) return;
  const root: HTMLElement = found;
  const data = JSON.parse($(root, '#scorecard-data').textContent!) as Data;
  const n = data.questions.length + 1; // + the business-type screen
  let state = load(n);
  let lastKeyNav = false;
  let advanceTimer = 0;
  let turnstile: TurnstileHandle | null = null;

  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
  const fieldsets = $$<HTMLFieldSetElement>(root, 'fieldset.q');
  const nextBtn = $<HTMLButtonElement>(root, '[data-action="next"]');
  const backBtn = $<HTMLButtonElement>(root, '[data-action="back"]');
  const progress = $(root, '[data-progress]');
  const scores = () => state.answers.slice(1) as number[];
  const parse = (f: HTMLFieldSetElement, v: string): Answer => (f.dataset.kind === 'industry' ? v : Number(v));

  function show(step: Step, focus = true) {
    state.step = step;
    $$(root, '[data-state]').forEach((el) => (el.hidden = el.dataset.state !== step));
    if (step === 'questions') showQuestion(focus);
    if (step === 'result') showResult(focus);
    save();
  }

  function showQuestion(focus: boolean) {
    const i = state.index;
    fieldsets.forEach((f, j) => (f.hidden = j !== i));
    progress.textContent = fieldsets[i].dataset.label ?? '';
    $(root, '[data-progress-bar]').style.width = `${(i / n) * 100}%`;
    const a = state.answers[i];
    $$<HTMLInputElement>(fieldsets[i], 'input').forEach((r) => (r.checked = a !== null && parse(fieldsets[i], r.value) === a));
    nextBtn.disabled = a === null;
    backBtn.disabled = i === 0;
    if (focus) $(fieldsets[i], '.q-text').focus({ preventScroll: true });
  }

  function answer(i: number, value: Answer, auto: boolean) {
    state.answers[i] = value;
    save();
    nextBtn.disabled = false;
    if (i > 0) track('scorecard_answer', { q: data.questions[i - 1].id, score: value as number });
    if (!auto) return;
    clearTimeout(advanceTimer);
    advanceTimer = window.setTimeout(next, reduced() ? 0 : 250);
  }

  function next() {
    if (state.answers[state.index] === null) return;
    if (state.index < n - 1) { state.index++; show('questions'); }
    else show('result');
  }

  function showResult(focus: boolean) {
    const r = computeResult(scores(), data);
    $(root, '[data-total]').textContent = String(r.points);
    $(root, '[data-band]').textContent = r.band.headline;
    $(root, '[data-band-body]').textContent = r.band.body;
    requestAnimationFrame(() => ($(root, '[data-score-fill]').style.width = `${(r.points / r.max) * 100}%`));
    const list = $(root, '[data-fixes]');
    list.replaceChildren(...r.topFixes.map((q) => Object.assign(document.createElement('li'), { textContent: q.fix })));
    const perfect = r.topFixes.length === 0;
    list.hidden = perfect;
    $(root, '[data-fixes-label]').hidden = perfect;
    $(root, '[data-perfect]').hidden = !perfect;
    if (!state.completed) {
      state.completed = true;
      track('scorecard_complete', { total: r.points, band: r.band.slug, industry: String(state.answers[0]) });
    }
    if (!state.sent) turnstile ??= loadTurnstile($(root, '[data-turnstile]'));
    $<HTMLFormElement>(root, '[data-email-form]').hidden = state.sent;
    $(root, '[data-sent]').hidden = !state.sent;
    if (focus) $(root, '[data-result-focus]').focus();
  }

  // Events
  root.addEventListener('click', (e) => {
    const action = (e.target as Element).closest<HTMLElement>('[data-action]')?.dataset.action;
    if (action === 'start') {
      track('scorecard_start', { source: source() });
      state.index = Math.max(0, state.answers.findIndex((a) => a === null));
      show('questions');
    } else if (action === 'next') next();
    else if (action === 'back' && state.index > 0) { clearTimeout(advanceTimer); state.index--; show('questions'); }
    else if (action === 'restart') {
      state = fresh(n);
      show('intro', false);
      $(root, '[data-action="start"]').focus();
    }
  });

  fieldsets.forEach((f, i) => f.addEventListener('change', (e) => {
    answer(i, parse(f, (e.target as HTMLInputElement).value), !lastKeyNav);
    lastKeyNav = false;
  }));

  document.addEventListener('keydown', (e) => {
    if (state.step !== 'questions' || e.metaKey || e.ctrlKey || e.altKey) return;
    lastKeyNav = e.key.startsWith('Arrow');
    const k = Number(e.key);
    const inputs = $$<HTMLInputElement>(fieldsets[state.index], 'input');
    if (k >= 1 && k <= inputs.length) {
      const input = inputs[k - 1];
      e.preventDefault();
      input.checked = true;
      input.focus({ preventScroll: true });
      answer(state.index, parse(fieldsets[state.index], input.value), true);
    } else if (e.key === 'Enter' && !(e.target as Element).closest('button, a')) {
      e.preventDefault();
      next();
    }
  });

  import('./scorecard-email').then(({ bindEmailForm }) =>
    bindEmailForm(root, data.errors, () => {
      const r = computeResult(scores(), data);
      return { answers: state.answers, heroVariant: heroVariant(), band: r.band.slug };
    }, () => turnstile, () => {
      state.sent = true;
      save();
    }),
  );

  // Restore where the visitor left off.
  show(state.step, false);
}
