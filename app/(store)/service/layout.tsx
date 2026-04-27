import type { Metadata } from 'next';

const SITE = 'RNH Imports';

export const metadata: Metadata = {
  title: 'Our Services — Import & Logistics',
  description:
    'End-to-end import services by RNH Imports: supplier sourcing and verification in China, quality inspection, international shipping and customs clearance, offloading, warehousing, and last-mile delivery across Ghana.',
  keywords: [
    'import services Ghana', 'supplier sourcing China', 'quality inspection imports',
    'shipping and customs Ghana', 'logistics Ghana', 'offloading services Accra',
    'delivery service Ghana', 'RNH Imports services', 'China imports logistics',
    'electronics import consultancy Ghana', 'wholesale electronics import Ghana',
  ],
  openGraph: {
    title: `Our Services | ${SITE}`,
    description: 'From supplier sourcing in China to delivery at your door in Ghana. Complete import and logistics services by RNH Imports.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `Services — ${SITE}`, type: 'image/png' }],
    url: '/service',
    locale: 'en_GH',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Our Services | ${SITE}`,
    description: 'Complete import services: sourcing, quality checks, shipping, customs, and delivery across Ghana.',
    images: [{ url: '/og-image.png', alt: `Services — ${SITE}` }],
  },
  alternates: { canonical: '/service' },
};

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://rnhimports.com';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/service` },
  ],
};

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {children}
    </>
  );
}
