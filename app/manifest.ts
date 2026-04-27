import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RNH Imports — Premium Electronics, Imported for Ghana',
    short_name: 'RNH Imports',
    description: 'Ghana\'s trusted electronics import company. Genuine laptops, phones, tablets, cameras and more — sourced direct from China, delivered to your door.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#1B2A6B',
    orientation: 'portrait-primary',
    categories: ['shopping', 'lifestyle', 'business'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      { src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
    screenshots: [
      { src: '/og-image.png', sizes: '1200x630', type: 'image/png', label: 'RNH Imports — Premium Electronics for Ghana' },
    ],
    shortcuts: [
      { name: 'Shop All Products', short_name: 'Shop', description: 'Browse our full electronics catalogue', url: '/shop', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }] },
      { name: 'Categories', short_name: 'Categories', description: 'Browse by product category', url: '/categories', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }] },
      { name: 'Contact Us', short_name: 'Contact', description: 'Get in touch via WhatsApp or email', url: '/contact', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }] },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}
