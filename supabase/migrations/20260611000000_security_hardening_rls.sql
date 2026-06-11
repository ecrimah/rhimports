-- ============================================================================
-- Security hardening: RLS fixes
--   1. store_settings: stop exposing integration secrets to the public/anon key
--   2. profiles: prevent users from escalating their own role to admin/staff
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. store_settings — hide secret integration keys from non-staff
-- ----------------------------------------------------------------------------
-- Previously: "Staff view settings" used USING (true), so ANY client with the
-- public anon key could read every row, including keys like
-- integration_resend_api_key, integration_moolre_sms_api_key,
-- integration_recaptcha_secret_key, etc.
--
-- New policy: the public may read only non-secret settings (e.g. site_name).
-- Admins/staff continue to read everything. Secret keys are namespaced with the
-- "integration_" prefix and are now only visible to admins/staff.

DROP POLICY IF EXISTS "Staff view settings" ON public.store_settings;

CREATE POLICY "Public read non-secret settings" ON public.store_settings
  FOR SELECT
  USING (
    public.is_admin_or_staff()
    OR key NOT LIKE 'integration_%'
  );

-- ----------------------------------------------------------------------------
-- 2. profiles — block self role escalation
-- ----------------------------------------------------------------------------
-- The "Users update own profile" policy (USING auth.uid() = id) had no column
-- restriction, so an authenticated user could run
--   update profiles set role = 'admin' where id = auth.uid()
-- and grant themselves full admin access. This trigger rejects any change to
-- the role column unless performed by the service role (server) or an existing
-- administrator.

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.role() <> 'service_role'
       AND NOT EXISTS (
         SELECT 1 FROM public.profiles p
         WHERE p.id = auth.uid() AND p.role = 'admin'::user_role
       )
    THEN
      RAISE EXCEPTION 'Only administrators may change a user role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_self_escalation ON public.profiles;

CREATE TRIGGER trg_prevent_role_self_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_self_escalation();
