'use client';

import Link from 'next/link';
import { useCMS } from '@/context/CMSContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { HERO_IMAGES_OTHER_PAGES } from '@/lib/hero-images';

export default function AboutPage() {
  usePageTitle('Our Story');
  const { getSetting } = useCMS();

  const siteName = getSetting('site_name') || 'RNH Imports';

  // CMS-driven content
  const heroTitle = getSetting('about_hero_title') || 'Our Story';
  const heroSubtitle = getSetting('about_hero_subtitle') || 'Making premium tech accessible to every Ghanaian — one genuine import at a time.';
  const storyTitle = getSetting('about_story_title') || 'About Us — RNH Imports';
  const storyContent = getSetting('about_story_content') || '';
  const storyImage = '/images/gallery/founder-team.png';
  const founderName = getSetting('about_founder_name') || 'Randy & Hannah';
  const founderTitle = getSetting('about_founder_title') || 'Co-Founders';
  const mission1Title = getSetting('about_mission1_title') || 'Sourced Directly, Priced Fairly';
  const mission1Content = getSetting('about_mission1_content') || '';
  const mission2Title = getSetting('about_mission2_title') || 'Genuine Products, Every Time';
  const mission2Content = getSetting('about_mission2_content') || '';
  const valuesTitle = getSetting('about_values_title') || 'Why Choose RNH Imports?';
  const valuesSubtitle = getSetting('about_values_subtitle') || 'Trust, transparency, and reliability — every step of the way.';
  const ctaTitle = getSetting('about_cta_title') || 'Ready to get the tech you want?';
  const ctaSubtitle = getSetting('about_cta_subtitle') || 'Browse our catalogue of genuine imported electronics — laptops, phones, tablets, cameras and more. Delivered across Ghana.';

  // Story paragraphs (split by newlines)
  const storyParagraphs = storyContent.split('\n').filter((p: string) => p.trim());

  const values = [
    {
      icon: 'ri-shield-check-line',
      title: 'Trust & Transparency',
      description: 'We believe in open, honest trade. You know exactly where your goods are and what you are paying for — no hidden fees.'
    },
    {
      icon: 'ri-links-line',
      title: 'Verified Suppliers',
      description: 'Our strong network of vetted Chinese suppliers means you get genuine, quality products every time.'
    },
    {
      icon: 'ri-truck-line',
      title: 'End-to-End Service',
      description: 'From sourcing and shipping to customs clearance and delivery in Ghana — we handle every step so you don\'t have to.'
    },
    {
      icon: 'ri-group-line',
      title: 'Built for Growth',
      description: 'Whether you\'re an individual, a small business, or a growing brand — we scale with you and help you import smarter.'
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="bg-black text-white pb-32 lg:pb-48 pt-24 lg:pt-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src={HERO_IMAGES_OTHER_PAGES[0]}
            alt="About Background"
            className="w-full h-full object-cover"
            onError={(e) => { const t = e.currentTarget; if (t.src !== HERO_IMAGES_OTHER_PAGES[0]) t.src = HERO_IMAGES_OTHER_PAGES[2]; }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-serif mb-6 tracking-tight text-white drop-shadow-lg">{heroTitle}</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light">
            {heroSubtitle}
          </p>
        </div>
      </div>

      {/* Story Section - Scrolling Narrative */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 lg:-mt-32 relative z-20 pb-24">
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-[3/4]">
                <img
                  src={storyImage}
                  alt={`${founderName} - ${founderTitle}`}
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105 filter contrast-110"
                  onError={(e) => { const t = e.currentTarget; if (t.src !== HERO_IMAGES_OTHER_PAGES[1]) t.src = HERO_IMAGES_OTHER_PAGES[2]; }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent p-8 lg:p-12 text-white">
                  <p className="font-serif text-2xl mb-1">{founderName}</p>
                  <p className="text-gray-300 font-medium tracking-wide uppercase text-sm">{founderTitle}</p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-stone-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-stone-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="inline-block py-1 px-3 rounded-full bg-stone-100 text-gray-900 text-xs font-bold mb-6 tracking-wide uppercase">
                Our Beginning
              </span>
              <h2 className="text-4xl lg:text-5xl font-serif text-gray-900 mb-8 leading-tight">{storyTitle}</h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-light">
                {storyParagraphs.length > 0 ? (
                  storyParagraphs.map((p: string, i: number) => <p key={i}>{p}</p>)
                ) : (
                  <>
                    <p>
                      RNH Imports is a trusted importation and logistics company based in Ghana, committed to making global trade simple, reliable, and accessible for individuals and businesses.
                    </p>
                    <p>
                      Founded with a vision to bridge the gap between international suppliers and the Ghanaian market, we specialize in sourcing high quality products from China and delivering them safely and efficiently to our clients in Ghana.
                    </p>
                    <p>
                      At RNH Imports, we understand that importation can feel overwhelming, from finding the right suppliers to handling shipping, customs clearance, and delivery. That is why we provide a seamless, end to end solution that takes the stress off our clients and guarantees peace of mind.
                    </p>
                    <p>
                      With a strong network of verified suppliers, efficient shipping systems, and a dedicated warehouse presence in Ghana, we ensure that every item entrusted to us is handled with care and delivered on time.
                    </p>
                    <p>
                      Our company is built on trust, transparency, and reliability. Whether you are a small business owner, a growing brand, or an individual looking to import goods, RNH Imports is your dependable partner every step of the way.
                    </p>
                    <p>
                      We do not just move goods, we build lasting relationships and help businesses grow through smart, efficient import solutions.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section - Split Cards */}
      <section className="bg-stone-50 py-12 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
            <span className="text-gray-500 font-medium tracking-widest uppercase text-[10px] mb-2 block">Our Mission</span>
            <h2 className="text-2xl md:text-3xl font-serif text-gray-900">What Drives Us Forward</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 lg:gap-5">
            <div className="bg-white p-6 lg:p-7 rounded-2xl shadow-sm border border-stone-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform duration-300">
                <i className="ri-plane-line text-xl text-white"></i>
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-2">{mission1Title}</h3>
              <p className="text-gray-600 text-base leading-relaxed font-light">
                {mission1Content || 'We source laptops, tablets, phones, cameras, audio equipment and gaming consoles directly from verified manufacturers in China. No middlemen, no inflated markups — just honest prices on genuine tech.'}
              </p>
            </div>

            <div className="bg-primary p-6 lg:p-7 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group text-white">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 shadow-inner group-hover:scale-105 transition-transform duration-300">
                <i className="ri-heart-line text-xl text-white"></i>
              </div>
              <h3 className="text-xl font-serif mb-2">{mission2Title}</h3>
              <p className="text-gray-300 text-base leading-relaxed font-light">
                {mission2Content || 'Every product we sell is genuine. We carefully verify our supply chain so you never have to worry about counterfeits. What you see is exactly what you get — backed by our commitment to honest, transparent trading.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Grid */}
      <section className="py-14 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 lg:mb-10 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl lg:text-[34px] font-serif text-gray-900 mb-2">{valuesTitle}</h2>
              <p className="text-base lg:text-lg text-gray-600 font-light">{valuesSubtitle}</p>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-gray-900 font-bold hover:gap-4 transition-all">
              Browse Products <i className="ri-arrow-right-line"></i>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {values.map((value, index) => (
              <div key={index} className="bg-stone-50 p-5 lg:p-6 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 group">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:bg-primary transition-colors duration-300">
                  <i className={`${value.icon} text-xl text-gray-900 group-hover:text-white transition-colors duration-300`}></i>
                </div>
                <h3 className="text-lg lg:text-xl font-serif text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed font-light text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Voices */}
      <section className="py-12 lg:py-14 bg-stone-50 border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/5] max-w-md mx-auto rounded-3xl overflow-hidden bg-gray-900 shadow-2xl shadow-gray-300/50">
                <img
                  src="/images/about/customer-voices-team.png"
                  alt="RNH Imports team outside the Ghana operations location"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="inline-block py-1 px-3 rounded-full bg-white text-gray-900 text-[10px] font-bold tracking-widest uppercase mb-4">
                Customer Voices
              </span>
              <h2 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-4 leading-tight">
                What our customers say about us.
              </h2>
              <p className="text-gray-600 text-sm sm:text-base font-light leading-relaxed mb-5 max-w-md">
                We let the work speak for itself, but the kind words from buyers across Ghana keep us grounded — and remind us why we started RNH Imports in the first place.
              </p>
              <blockquote className="border-l-2 border-primary pl-4 max-w-md">
                <p className="text-gray-700 italic text-sm sm:text-base leading-relaxed mb-2">
                  &ldquo;Genuine product, smooth communication, and the package arrived exactly when they said it would. RNH Imports is now my go-to.&rdquo;
                </p>
                <footer className="text-xs text-gray-400 tracking-wide uppercase font-bold">— Verified buyer, Accra</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-30">
          <img
            src={HERO_IMAGES_OTHER_PAGES[3]}
            alt="Background"
            className="w-full h-full object-cover grayscale"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 text-white">
          <h2 className="text-4xl md:text-6xl font-serif mb-8 tracking-tight drop-shadow-lg">{ctaTitle}</h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
            {ctaSubtitle}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-white/20 transform hover:-translate-y-1"
          >
            Browse Our Products
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </section>
    </div>
  );
}
