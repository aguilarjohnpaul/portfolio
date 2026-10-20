// Scoring data for the /api/scorecard Function, built from scorecard.yaml.
// The Function reads it from static assets so server and browser always agree.
import type { APIRoute } from 'astro';
import { doc } from '../lib/content';

export const GET: APIRoute = async () => {
  const sc = await doc('scorecard');
  const data = {
    standard_options: sc.standard_options,
    stages: sc.stages,
    bands: sc.bands,
    team_sizes: sc.email.team_sizes.map(({ value }) => ({ value })),
    questions: sc.questions.map(({ id, stage, text, fix, options }) => ({ id, stage, text, fix, options })),
  };
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};
