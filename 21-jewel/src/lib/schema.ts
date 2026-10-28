// JSON-LD builders (spec §11).
import { ladder, type Offer, type OffersData, type SiteData } from './content';

/** "$1,250" → 1250. Placeholders or empty prices give null. */
function amount(price: string): number | null {
  const n = Number(price.replace(/[^0-9.]/g, ''));
  return price.trim() && Number.isFinite(n) && n > 0 ? n : null;
}

function offerLd(o: Offer, site: SiteData) {
  const price = o.free ? 0 : amount(o.price_from);
  const out: Record<string, unknown> = {
    '@type': 'Offer',
    url: new URL(`/pricing#${o.id}`, site.brand.url).href,
    itemOffered: { '@type': 'Service', name: o.name, description: o.one_liner },
  };
  if (price !== null) {
    out.priceSpecification = {
      '@type': 'UnitPriceSpecification',
      price,
      priceCurrency: 'USD',
      ...(o.price_suffix === '/month' ? { unitText: 'MONTH', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } } : {}),
      ...(price > 0 ? { minPrice: price } : {}),
    };
  }
  return out;
}

/** Public profile URLs that are set in site.yaml links. */
const sameAs = (site: SiteData) => [site.links.google_profile, site.links.linkedin].filter((u) => /^https?:\/\//.test(u));

export function professionalService(site: SiteData, offers: OffersData) {
  const list = ladder(offers);
  const paid = list.map((o) => (o.free ? null : amount(o.price_from))).filter((n): n is number => n !== null);
  const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': new URL('/#business', site.brand.url).href,
    name: site.brand.legal_name,
    alternateName: site.brand.name,
    url: site.brand.url,
    email: site.brand.email,
    telephone: `+1-${site.brand.phone_href.slice(2, 5)}-${site.brand.phone_href.slice(5, 8)}-${site.brand.phone_href.slice(8)}`,
    logo: new URL('/apple-touch-icon.png', site.brand.url).href,
    image: new URL(site.seo.og_image, site.brand.url).href,
    description: site.brand.one_liner,
    ...(paid.length ? { priceRange: `${usd(Math.min(...paid))}–${usd(Math.max(...paid))}` } : {}),
    address: { '@type': 'PostalAddress', addressLocality: 'San Antonio', addressRegion: 'TX', addressCountry: 'US' },
    areaServed: [
      { '@type': 'City', name: 'San Antonio, TX' },
      ...['Bexar County', 'Comal County', 'Guadalupe County', 'Kendall County', 'Medina County'].map((name) => ({ '@type': 'AdministrativeArea', name: `${name}, TX` })),
      { '@type': 'State', name: 'Texas' },
    ],
    founder: { '@type': 'Person', name: site.brand.founder },
    ...(sameAs(site).length ? { sameAs: sameAs(site) } : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${site.brand.name} offers`,
      itemListElement: list.map((o) => offerLd(o, site)),
    },
  };
}

export function website(site: SiteData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': new URL('/#website', site.brand.url).href,
    name: site.brand.legal_name,
    url: site.brand.url,
    publisher: { '@id': new URL('/#business', site.brand.url).href },
  };
}

export function faqPage(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** BreadcrumbList for everything below the home page. `trail` is in order, without Home. */
export function breadcrumbs(site: SiteData, trail: { name: string; path: string }[]) {
  const items = [{ name: 'Home', path: '/' }, ...trail];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((b, i) => ({
      '@type': 'ListItem', position: i + 1, name: b.name, item: new URL(b.path, site.brand.url).href,
    })),
  };
}

/** Service entity for a service or industry page, priced from its offer when there is one. */
export function serviceLd(site: SiteData, args: { path: string; name: string; description: string; offer?: Offer; serviceType?: string }) {
  const { path, name, description, offer, serviceType } = args;
  const out: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': new URL(`${path}#service`, site.brand.url).href,
    name,
    description,
    url: new URL(path, site.brand.url).href,
    serviceType: serviceType ?? name,
    provider: { '@id': new URL('/#business', site.brand.url).href },
    areaServed: [{ '@type': 'City', name: 'San Antonio, TX' }, { '@type': 'State', name: 'Texas' }],
  };
  if (offer) out.offers = offerLd(offer, site);
  return out;
}

/** WebPage with a speakable pointer at the answer-first opening paragraph (Change 03 §9). */
export function speakablePage(site: SiteData, path: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': new URL(`${path}#webpage`, site.brand.url).href,
    url: new URL(path, site.brand.url).href,
    name,
    isPartOf: { '@id': new URL('/#website', site.brand.url).href },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.prose > p:first-of-type'] },
  };
}

/** Article + Person for a guide. Dates are ISO strings. */
export function articleLd(site: SiteData, a: { path: string; title: string; description: string; published: string; updated: string; author: { name: string; role: string } }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': new URL(`${a.path}#article`, site.brand.url).href,
    headline: a.title,
    description: a.description,
    url: new URL(a.path, site.brand.url).href,
    datePublished: a.published,
    dateModified: a.updated,
    inLanguage: 'en-US',
    author: { '@type': 'Person', name: a.author.name, jobTitle: a.author.role, url: new URL('/about', site.brand.url).href, worksFor: { '@id': new URL('/#business', site.brand.url).href } },
    publisher: { '@id': new URL('/#business', site.brand.url).href },
    isPartOf: { '@id': new URL('/#website', site.brand.url).href },
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.prose > p:first-of-type'] },
  };
}

/** Person entity for /about. */
export function personLd(site: SiteData, p: { name: string; role: string; line: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': new URL('/about#person', site.brand.url).href,
    name: p.name,
    jobTitle: p.role,
    description: p.line,
    url: new URL('/about', site.brand.url).href,
    telephone: `+1-${site.brand.phone_href.slice(2, 5)}-${site.brand.phone_href.slice(5, 8)}-${site.brand.phone_href.slice(8)}`,
    email: site.brand.email,
    worksFor: { '@id': new URL('/#business', site.brand.url).href },
    ...(sameAs(site).length ? { sameAs: sameAs(site) } : {}),
  };
}
