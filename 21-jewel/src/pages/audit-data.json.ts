// Allowed option values for the /api/audit Function, built from pages.yaml.
import type { APIRoute } from 'astro';
import { doc } from '../lib/content';

export const GET: APIRoute = async () => {
  const { form } = (await doc('pages')).audit;
  const data = { situations: form.situations.map((o) => o.value) };
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
};
