'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCMS } from '@/context/CMSContext';
import { DEFAULT_CONTACT_ADDRESS, DEFAULT_CONTACT_PHONE } from '@/lib/contact';

export default function Footer() {
  const { getSetting } = useCMS();
  const [logoFailed, setLogoFailed] = useState(false);

  const siteName = getSetting('site_name') || 'RNH Imports';
  const footerLogo = '/logo.png';
  const rawFooterLogoHeight = Number.parseInt(getSetting('footer_logo_height') || '40', 10);
  const footerLogoHeight = Number.isFinite(rawFooterLogoHeight) ? Math.min(56, Math.max(24, rawFooterLogoHeight)) : 40;
  const contactEmail = getSetting('contact_email') || 'info@rnhimports.com';
  const contactPhone = getSetting('contact_phone') || DEFAULT_CONTACT_PHONE;
  const contactHours = getSetting('contact_hours') || 'Mon – Fri: 9am – 6pm · Sat: 10am – 4pm';
  const contactAddress = getSetting('contact_address') || DEFAULT_CONTACT_ADDRESS;
  const links = [
    { label: 'Shop', href: '/shop' },
    { label: 'Services', href: '/service' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ];

  const rawFooterBg = getSetting('footer_bg');
  const rawFooterText = getSetting('footer_text');

  return (
    <footer
      className="relative overflow-hidden bg-[#1B2A6B] text-white"
      style={{
        ...(rawFooterBg ? { backgroundColor: rawFooterBg } : {}),
        ...(rawFooterText ? { color: rawFooterText } : {}),
      }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              {!logoFailed ? (
                <img
                  src={footerLogo}
                  alt={siteName}
                  className="w-auto object-contain"
                  style={{ height: `${footerLogoHeight}px` }}
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <span className="font-bold text-white text-xl tracking-wide">{siteName}</span>
              )}
            </Link>
            <p className="text-white/80 text-sm leading-relaxed mb-3">
              Ghana&apos;s trusted electronics import store. Laptops, tablets, phones, cameras &amp; more — sourced directly and delivered across Accra.
            </p>
          </div>

          {/* Links Column */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Explore</h3>
            <ul className="space-y-2">
              {links.slice(0, 5).map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-white transition-all duration-300"></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {links.slice(5).map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                    <span className="w-0 group-hover:w-2 h-px bg-white transition-all duration-300"></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="col-span-1">
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <i className="ri-mail-line mt-0.5 shrink-0"></i>
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors break-all">
                  {contactEmail}
                </a>
              </li>
              {contactPhone && (
                <li className="flex items-start gap-3">
                  <i className="ri-phone-line mt-0.5 shrink-0"></i>
                  <div className="flex flex-col gap-1">
                    <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                      {contactPhone}
                    </a>
                    <a
                      href={`https://wa.me/233${contactPhone.replace(/\s/g, '').replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-xs"
                    >
                      <i className="ri-whatsapp-line"></i> WhatsApp
                    </a>
                  </div>
                </li>
              )}
              <li className="flex items-start gap-3">
                <i className="ri-map-pin-line mt-0.5 shrink-0"></i>
                <span>{contactAddress}</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="ri-time-line mt-0.5 shrink-0"></i>
                <span>{contactHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-5 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/70">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            <a
              href="https://doctorbarns.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/75 hover:text-white transition-colors"
            >
              Powered by Doctorbarns Tech
            </a>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
