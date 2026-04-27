-- Canonical store contact (footer, contact page, WhatsApp, maps)
-- Replace the placeholder values below with your own store details before applying.
INSERT INTO public.store_settings (key, value, updated_at)
VALUES
  ('contact_phone', to_jsonb('YOUR_STORE_PHONE'::text), now()),
  ('contact_address', to_jsonb('YOUR_STORE_ADDRESS'::text), now()),
  ('contact_map_link', to_jsonb('https://www.google.com/maps/search/?api=1&query=YOUR_STORE_LOCATION'::text), now())
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();
