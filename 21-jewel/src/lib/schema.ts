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
    url: new URL(`/offers#${o.id}`, site.brand.url).href,
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
