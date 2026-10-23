// Scoring data for the /api/scorecard Function, built from scorecard.yaml.
// The Function reads it from static assets so server and browser always agree.
import type { APIRoute } from 'astro';
import { doc } from '../lib/content';

export const GET: APIRoute = async () => {
  const sc = await doc('scorecard');
  const data = {
    industry: sc.industry,
    bands: sc.bands,
    questions: sc.questions.map(({ id, text, fix, options }) => ({ id, text, fix, options })),
  };
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};
