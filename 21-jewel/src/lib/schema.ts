// JSON-LD builders (spec §11).
import type { OffersData, SiteData } from './content';

export function professionalService(site: SiteData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.brand.name,
    url: site.brand.url,
    email: site.brand.email,
    image: new URL(site.seo.og_image, site.brand.url).href,
    description: site.seo.pages.home?.description,
    address: { '@type': 'PostalAddress', addressLocality: 'San Antonio', addressRegion: 'TX', addressCountry: 'US' },
    areaServed: [
      { '@type': 'City', name: 'San Antonio, TX' },
      { '@type': 'Country', name: 'United States' },
    ],
    founder: { '@type': 'Person', name: site.brand.founder },
  };
}

export function faqPage(faq: OffersData['faq']) {
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
