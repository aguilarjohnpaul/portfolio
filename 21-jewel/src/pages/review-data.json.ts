// Allowed option values for the /api/review Function, built from pages.yaml.
import type { APIRoute } from 'astro';
import { doc } from '../lib/content';

export const GET: APIRoute = async () => {
  const { form } = (await doc('pages')).review;
  const data = { sources: form.sources.map((o) => o.value), formats: form.formats.map((o) => o.value) };
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};
