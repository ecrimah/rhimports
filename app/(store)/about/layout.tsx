import { Metadata } from 'next';

const SITE = 'RNH Imports';

export const metadata: Metadata = {
  title: 'About Us — Our Story',
  description:
    'RNH Imports is a trusted importation and logistics company based in Amasaman, Accra. Founded to bridge Ghana and the world, we source genuine electronics from verified Chinese manufacturers and deliver them safely across Ghana.',
  keywords: [
    'about RNH Imports', 'RNH Imports story', 'electronics importer Ghana',
    'Ghana import company', 'China to Ghana imports', 'trusted importer Accra',
    'Amasaman electronics', 'import logistics Ghana', 'RNH Imports founder',
  ],
  openGraph: {
    title: `About Us | ${SITE}`,
    description: 'Our story: from a vision to Ghana\'s trusted electronics import partner. Genuine products, direct sourcing, honest prices.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `About — ${SITE}`, type: 'image/png' }],
    url: '/about',
    locale: 'en_GH',
  },
  twitter: {
    card: 'summary_large_image',
    title: `About Us | ${SITE}`,
    description: 'Learn how RNH Imports became Ghana\'s trusted electronics import partner.',
    images: [{ url: '/og-image.png', alt: `About — ${SITE}` }],
  },
  alternates: { canonical: '/about' },
};

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://rnhimports.com';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'About Us', item: `${SITE_URL}/about` },
  ],
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {children}
    </>
  );
}
