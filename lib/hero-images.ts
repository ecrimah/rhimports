/**
 * Hero images from public folder.
 * First 3 = home page slider; rest = other pages' hero sections.
 * Replace with your own images — add files to /public and update the paths below.
 */
export const HERO_IMAGES = [
  '/hero/iphone.jpg',
  '/hero/dell-laptop.jpg',
  '/hero/canon-camera.jpg',
  '/hero/hero_smartwatch.png',
  '/hero/hero_earbuds.png',
  '/hero/hero_drone.png',
  '/hero/hero_gaming_console.png',
  '/hero/hero_vr_headset.png',
  '/hero/hero_keyboard.png',
  '/hero/hero_monitor.png',
  '/hero/hero_microphone.png',
  '/hero/hero_powerbank.png',
  '/hero/hero_action_camera.png',
  '/hero/hero_smart_speaker.png',
  '/hero/hero_tablet_setup.png',
  '/hero/hero_lens.png',
  '/hero/hero_laptop_setup.png',
] as const;

/** Home page slider (first 3) */
export const HERO_SLIDES_HOME = HERO_IMAGES.slice(0, 3);

/** For other pages' hero sections (remaining 14) */
export const HERO_IMAGES_OTHER_PAGES = HERO_IMAGES.slice(3);
