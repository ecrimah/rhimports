# RNH Imports — Setup Checklist

Complete these steps to finish launching the site.

---

## Assets (REQUIRED — see `/public/ASSETS_GUIDE.md`)

- [ ] Add `/public/logo.png` — your brand logo (used in Header, Footer, Admin Login)
- [ ] Add `/public/favicon.ico` (32×32px)
- [ ] Add `/public/apple-touch-icon.png` (180×180px)
- [ ] Add `/public/icon-192.png` and `/public/icon-512.png` (PWA icons)
- [ ] Add `/public/og-image.png` (1200×630px — social share image)
- [ ] Add hero images `/public/hero-1.jpg` through `/public/hero-17.jpg`
  (or update the paths in `lib/hero-images.ts` to match your filenames)

---

## Environment Variables

- [ ] Copy `.env.example` to `.env.local` and fill in all values
- Key ones: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`, payment keys

---

## Colors

- [ ] Open `tailwind.config.js` and replace `#YOUR_PRIMARY_COLOR`, `#YOUR_ACCENT_COLOR`, etc. with your logo's colors
- [ ] Update `app/manifest.ts` — replace `#YOUR_THEME_COLOR` with your primary brand color
- [ ] Update `app/layout.tsx` — replace `#YOUR_THEME_COLOR` in the `other` metadata block
- [ ] Update `components/Footer.tsx` — the `footer_bg` default (`#5B21B6`) can be changed to your primary color, or set it via Admin → Settings → `footer_bg`

---

## Services to Set Up

- [ ] **Supabase** — create project, run `/supabase/migrations/` in order, update keys in `.env.local`
- [ ] **Email (Resend)** — create account at resend.com, verify `rnhimports.com` domain, update `RESEND_API_KEY`
- [ ] **Payments** — configure Moolre and/or Paystack keys in `.env.local`
- [ ] **Analytics** — set `NEXT_PUBLIC_GA_MEASUREMENT_ID` for Google Analytics

---

## Store Content (via Admin Panel)

After deploying and granting yourself admin:

- [ ] Admin → Settings → set `site_name` = **RNH Imports**
- [ ] Admin → Settings → upload logo, set brand colors, working hours
- [ ] Admin → Settings → set contact email, phone, address, WhatsApp hours
- [ ] Admin → Settings → configure hero headlines and about page content
- [ ] Admin → Products → add your product catalog
- [ ] Admin → Categories → create product categories

---

## Admin Access

After running migrations, grant yourself admin in Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Legal

- [ ] Update `app/(store)/privacy/page.tsx` with RNH Imports privacy policy
- [ ] Update `app/(store)/terms/page.tsx` with RNH Imports terms of service
- [ ] Update `app/(store)/refund-policy/page.tsx` with your refund policy

---

## SEO & Deployment

- [ ] Verify `NEXT_PUBLIC_APP_URL=https://rnhimports.com` in `.env.local`
- [ ] Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` after verifying in Google Search Console
- [ ] Configure `rnhimports.com` custom domain in Vercel/Netlify
- [ ] Test checkout flow end-to-end with payment sandbox keys before going live
