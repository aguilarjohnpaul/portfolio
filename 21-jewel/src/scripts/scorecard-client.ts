// Scorecard behavior: one page, three states (intro, questions, result + email).
// Progress is kept in sessionStorage so a refresh doesn't lose answers.
import { computeResult, type Band, type Question, type ScorecardData, type StageId } from '../lib/scorecard';
import { heroVariant, track } from '../lib/analytics';
import { loadTurnstile, type TurnstileHandle } from './turnstile';

type Step = 'intro' | 'questions' | 'result';
interface State { step: Step; index: number; answers: (number | null)[]; sent: boolean; completed: boolean }
interface Data extends ScorecardData {
  questions: Question[];
  stages: { id: StageId; name: string; slug: string }[];
  bands: Band[];
  errors: Record<string, string>;
}

const KEY = 'scorecard-v1';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => root.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(root: ParentNode, sel: string) => [...root.querySelectorAll<T>(sel)];

function load(n: number): State {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as State | null;
    if (s && Array.isArray(s.answers) && s.answers.length === n) return s;
  } catch {}
  return { step: 'intro', index: 0, answers: Array(n).fill(null), sent: false, completed: false };
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
  const n = data.questions.length;
  let state = load(n);
  let lastKeyNav = false;
  let advanceTimer = 0;
  let turnstile: TurnstileHandle | null = null;

  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
  const fieldsets = $$<HTMLFieldSetElement>(root, 'fieldset.q');
  const nextBtn = $<HTMLButtonElement>(root, '[data-action="next"]');
  const backBtn = $<HTMLButtonElement>(root, '[data-action="back"]');
  const progress = $(root, '[data-progress]');

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
    progress.textContent = progress.dataset.template!.replace('{n}', String(i + 1)).replace('{total}', String(n));
    $(root, '[data-progress-bar]').style.width = `${(i / n) * 100}%`;
    const a = state.answers[i];
    $$<HTMLInputElement>(fieldsets[i], 'input').forEach((r) => (r.checked = a !== null && Number(r.value) === a));
    nextBtn.disabled = a === null;
    backBtn.disabled = i === 0;
    if (focus) $(fieldsets[i], '.q-text').focus({ preventScroll: true });
  }

  function answer(i: number, score: number, auto: boolean) {
    state.answers[i] = score;
    save();
    nextBtn.disabled = false;
    track('scorecard_answer', { q: data.questions[i].id, score });
    if (!auto) return;
    clearTimeout(advanceTimer);
    advanceTimer = window.setTimeout(next, reduced() ? 0 : 250);
  }

  function next() {
    if (state.answers[state.index] === null) return;
    if (state.index < n - 1) { state.index++; show('questions'); }
    else show('result');
  }

  function result() {
    return computeResult(state.answers as number[], data);
  }

  function showResult(focus: boolean) {
    const r = result();
    const stageName = (id: StageId) => data.stages.find((s) => s.id === id)!.name;
    $(root, '[data-total]').textContent = String(r.total);
    $(root, '[data-band]').textContent = r.band.name;
    $(root, '[data-band-meaning]').textContent = r.band.meaning;
    $(root, '[data-leak]').textContent = stageName(r.weakestStage);
    $(root, '[data-fix]').textContent = r.onScreenFix.fix;
    if (!state.completed) {
      state.completed = true;
      const slug = data.stages.find((s) => s.id === r.weakestStage)!.slug;
      track('scorecard_complete', { total: r.total, band: r.band.slug, weakest_stage: slug });
    }
    if (state.sent) revealStages();
    else turnstile ??= loadTurnstile($(root, '[data-turnstile]'));
    $<HTMLFormElement>(root, '[data-email-form]').hidden = state.sent;
    $(root, '[data-sent]').hidden = !state.sent;
    if (focus) $(root, '[data-result-focus]').focus();
  }

  function revealStages() {
    const r = result();
    $(root, '[data-stages]').hidden = false;
    $$(root, '[data-stage]').forEach((li) => {
      const id = li.dataset.stage as StageId;
      li.classList.toggle('weakest', id === r.weakestStage);
      $(li, '[data-stage-val]').textContent = String(r.stages[id]);
      requestAnimationFrame(() => ($(li, '[data-stage-fill]').style.width = `${r.stages[id]}%`));
    });
  }

  // Events
  root.addEventListener('click', (e) => {
    const action = (e.target as Element).closest<HTMLElement>('[data-action]')?.dataset.action;
    if (action === 'start') {
      track('scorecard_start', { source: source() });
      state.index = state.answers.findIndex((a) => a === null);
      if (state.index < 0) state.index = 0;
      show('questions');
    } else if (action === 'next') next();
    else if (action === 'back' && state.index > 0) { clearTimeout(advanceTimer); state.index--; show('questions'); }
    else if (action === 'restart') {
      state = { step: 'intro', index: 0, answers: Array(n).fill(null), sent: false, completed: false };
      $(root, '[data-stages]').hidden = true;
      show('intro', false);
      $(root, '[data-action="start"]').focus();
    }
  });

  fieldsets.forEach((f, i) => f.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    answer(i, Number(input.value), !lastKeyNav);
    lastKeyNav = false;
  }));

  document.addEventListener('keydown', (e) => {
    if (state.step !== 'questions' || e.metaKey || e.ctrlKey || e.altKey) return;
    lastKeyNav = e.key.startsWith('Arrow');
    const k = Number(e.key);
    if (k >= 1 && k <= 4) {
      const input = $$<HTMLInputElement>(fieldsets[state.index], 'input')[k - 1];
      if (!input) return;
      e.preventDefault();
      input.checked = true;
      input.focus({ preventScroll: true });
      answer(state.index, Number(input.value), true);
    } else if (e.key === 'Enter' && !(e.target as Element).closest('button, a')) {
      e.preventDefault();
      next();
    }
  });

  import('./scorecard-email').then(({ bindEmailForm }) =>
    bindEmailForm(root, data.errors, () => {
      const r = result();
      return {
        answers: state.answers as number[],
        total: r.total,
        stages: r.stages,
        band: r.band.slug,
        weakestStage: data.stages.find((s) => s.id === r.weakestStage)!.slug,
        heroVariant: heroVariant(),
      };
    }, () => turnstile, () => {
      state.sent = true;
      save();
      revealStages();
    }),
  );

  // Restore where the visitor left off.
  show(state.step, false);
}
