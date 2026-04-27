# Asset Replacement Guide

All original project images have been removed from this directory.

## Required Assets to Add

| File | Size | Purpose |
|------|------|---------|
| `/public/favicon.ico` | 32×32px | Browser tab icon |
| `/public/apple-touch-icon.png` | 180×180px | iOS home screen |
| `/public/icon-192.png` | 192×192px | Android PWA icon |
| `/public/icon-512.png` | 512×512px | PWA splash screen |
| `/public/logo.png` | Vector/PNG | Main brand logo (used in Header, Footer, Admin Login) |
| `/public/og-image.png` | 1200×630px | Social share / Open Graph preview |

## Hero Images (Home Slider + Page Heroes)

The home page slider uses the first 3 images; remaining 14 are used for page hero sections.
Add your own images to `/public/` and update the paths in [lib/hero-images.ts](../lib/hero-images.ts):

| File | Purpose |
|------|---------|
| `/public/hero-1.jpg` | Home slider slide 1 |
| `/public/hero-2.jpg` | Home slider slide 2 |
| `/public/hero-3.jpg` | Home slider slide 3 |
| `/public/hero-4.jpg` through `/public/hero-17.jpg` | Page hero backgrounds |

Recommended size: **1920×1080px**, WebP or JPEG, under 300KB each.

## Tools

- Favicon generator: https://realfavicongenerator.net
- OG image creator: https://og-playground.vercel.app
- Image optimization: https://squoosh.app
- Free stock photos: https://unsplash.com
