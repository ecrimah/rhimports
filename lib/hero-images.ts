/**
 * Home hero carousel (6 slides).
 * Operational photos in /images/home plus gallery picks for sourcing context.
 */
const HOME_HERO_SLIDER = [
  '/images/gallery/factory-meeting.png',
  '/images/gallery/sourcing-partners.png',
  '/images/home/hero-slider-1-container-unloading.png',
  '/images/home/hero-slider-2-forklift.png',
  '/images/home/hero-slider-3-team-hq.png',
  '/images/gallery/container-load.png',
] as const;

export const HERO_SLIDES_HOME = [...HOME_HERO_SLIDER];

/**
 * Secondary page heroes — gallery + repeats (same pool as before for shop/about/contact).
 */
const SERVICE_GALLERY_HERO = [
  '/images/gallery/container-load.png',
  '/images/gallery/factory-meeting.png',
  '/images/gallery/sourcing-partners.png',
  '/images/gallery/forklift-offload.png',
  '/images/gallery/delivery-unload.png',
  '/images/gallery/factory-inspection.png',
  '/images/gallery/rnh-team-hq.png',
  '/images/gallery/team-partner-review.png',
] as const;

export const HERO_IMAGES = [
  ...SERVICE_GALLERY_HERO.slice(0, 3),
  ...SERVICE_GALLERY_HERO.slice(3),
  SERVICE_GALLERY_HERO[0],
  SERVICE_GALLERY_HERO[2],
] as const;

/** Shop, About, Contact, Cart, Wishlist heroes */
export const HERO_IMAGES_OTHER_PAGES = HERO_IMAGES.slice(3);
