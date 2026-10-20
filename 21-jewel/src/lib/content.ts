// One place to read each content document. Pages call these instead of getEntry.
import { getEntry, getCollection, type CollectionEntry } from 'astro:content';

type Single = 'site' | 'home' | 'offers' | 'scorecard' | 'founding' | 'studios' | 'pages' | 'testimonials';

export async function doc<K extends Single>(name: K): Promise<CollectionEntry<K>['data']> {
  const entry = (await getEntry(name, 'main')) as CollectionEntry<K> | undefined;
  if (!entry) throw new Error(`Missing content file src/content/${name}.yaml`);
  return entry.data;
}

/** Replace {key} tokens in a copy string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
}

export async function proofItems() {
  const [studies, t] = await Promise.all([getCollection('caseStudies'), doc('testimonials')]);
  return { studies: studies.filter((s) => s.data.published), testimonials: t.testimonials };
}

const warned = new Set<string>();
/** Print a build warning once per message. */
export function warn(message: string) {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(`\x1b[33m[21 Jewel]\x1b[0m ${message}`);
}

export type SiteData = CollectionEntry<'site'>['data'];
export type HomeData = CollectionEntry<'home'>['data'];
export type OffersData = CollectionEntry<'offers'>['data'];
export type Offer = OffersData['offers'][number];
export type ScorecardContent = CollectionEntry<'scorecard'>['data'];

/** True for copy still waiting on JP, like "[PRICE]" or "[CAL_LINK]". */
export const isPlaceholder = (s: string) => /^\[[A-Z0-9_ ]+\]$/.test(s.trim());

/** Cal.com link, or an email fallback until the link is set. */
export function calHref(site: SiteData): string {
  if (!isPlaceholder(site.links.cal)) return site.links.cal;
  warn('site.yaml links.cal is still a placeholder. "Book a call" links open an email instead.');
  return `mailto:${site.brand.email}?subject=${encodeURIComponent('Book a call')}`;
}

export function spotsOpen(site: SiteData) {
  return Math.max(0, site.founding.total - site.founding.filled);
}

/** "Free", "Starting at $750/month" or "Pricing on request" (spec §3). */
export function priceLabel(offer: Offer, labels: OffersData['page']['labels']): string {
  if (offer.free) return offer.type;
  if (!offer.price_from.trim()) {
    if (!offer.studio_only) warn(`offers.yaml "${offer.id}" has no price_from. Showing "${labels.on_request}".`);
    return labels.on_request;
  }
  if (isPlaceholder(offer.price_from)) warn(`offers.yaml "${offer.id}" price is still ${offer.price_from}.`);
  return `${labels.starting_at} ${offer.price_from}${offer.price_suffix ?? ''}`;
}

export const ladder = (o: OffersData) => o.offers.filter((x) => !x.studio_only);
