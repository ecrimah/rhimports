/** Default store phone when CMS / env not set. Replace via Admin → Settings or env. */
export const DEFAULT_CONTACT_PHONE = '0502300319';

/** Default store location when CMS not set. Replace via Admin → Settings or env. */
export const DEFAULT_CONTACT_ADDRESS = 'Amasaman Achiaman, Annosel Junction';

/** Google Maps search for the store. Replace with your location query. */
export const DEFAULT_CONTACT_MAP_LINK =
  'https://www.google.com/maps/search/?api=1&query=Amasaman+Achiaman+Annosel+Junction+Ghana';

/** Apply default contact values only when a field is missing. */
export function applyCanonicalContact(s: Record<string, string>): void {
  if (!s['contact_phone']?.trim()) s['contact_phone'] = DEFAULT_CONTACT_PHONE;
  if (!s['contact_address']?.trim()) s['contact_address'] = DEFAULT_CONTACT_ADDRESS;
  if (!s['contact_map_link']?.trim()) s['contact_map_link'] = DEFAULT_CONTACT_MAP_LINK;
}

/**
 * Format phone for WhatsApp wa.me link (digits only, with country code).
 * Adjust the country-code logic below for your region.
 */
export function toWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // Generic fallback — replace with your country-code logic as needed.
  return digits;
}
