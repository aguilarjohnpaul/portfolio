// /llms.txt: a plain index of the site for AI crawlers (Change 03 §9, optional). Built from site.yaml titles and published guides.
import type { APIRoute } from 'astro';
import { doc, guides } from '../lib/content';

export const GET: APIRoute = async () => {
  const [site, inds, services, list] = await Promise.all([doc('site'), doc('industries'), doc('services'), guides()]);
  const p = (path: string, key: string) => {
    const s = site.seo.pages[key];
    return s ? `- [${s.title.replace(/ · 21 Jewel Advisory$/, '')}](${site.brand.url}${path}): ${s.description}` : '';
  };
  const lines = [
    `# ${site.brand.legal_name}`,
    '',
    `> ${site.brand.one_liner}`,
    '',
    `Phone: ${site.brand.phone}. Email: ${site.brand.email}. Based in ${site.brand.location}; serves San Antonio and surrounding counties first, Texas by phone and screen share.`,
    '',
    '## Main pages',
    p('/', 'home'), p('/audit', 'audit'), p('/pricing', 'pricing'), p('/about', 'about'),
    '',
    '## Services',
    ...services.services.map((s) => p(`/services/${s.slug}`, `service-${s.slug}`)),
    '',
    '## Industries',
    ...inds.industries.map((i) => p(`/industries/${i.slug}`, i.slug)),
    ...(list.length ? ['', '## Guides', ...list.map((g) => `- [${g.data.title}](${site.brand.url}/learn/${g.id}): ${g.data.description}`)] : []),
    '',
    '## Policies',
    p('/privacy', 'privacy'),
  ];
  const out = lines.filter((l, i) => l !== '' || lines[i - 1] !== '').join('\n') + '\n';
  return new Response(out, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
