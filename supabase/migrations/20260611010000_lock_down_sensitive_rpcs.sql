-- ============================================================================
-- Lock down privileged / SECURITY DEFINER RPCs so anonymous (and non-admin)
-- callers cannot invoke them directly via PostgREST.
--
-- Most critical: mark_order_paid was executable by the anon role, meaning
-- anyone could mark any order as paid (and trigger stock reduction) without
-- paying — bypassing all gateway verification. It now requires the service
-- role (server) or an admin/staff session (POS).
-- ============================================================================

-- 1) mark_order_paid: add an in-function authorization guard. Payment/stock
--    logic is otherwise unchanged.
CREATE OR REPLACE FUNCTION public.mark_order_paid(order_ref text, moolre_ref text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_order orders;
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.is_admin_or_staff() THEN
    RAISE EXCEPTION 'Not authorized to mark orders as paid';
  END IF;

  UPDATE orders
  SET 
    payment_status = 'paid',
    status = CASE 
        WHEN status = 'pending' THEN 'processing'::order_status
        WHEN status = 'awaiting_payment' THEN 'processing'::order_status
        ELSE status
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) || 
               jsonb_build_object(
                   'moolre_reference', moolre_ref,
                   'payment_verified_at', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
               )
  WHERE order_number = order_ref
  RETURNING * INTO updated_order;

  IF updated_order.id IS NOT NULL THEN
      IF (updated_order.metadata->>'stock_reduced') IS NULL THEN
          UPDATE products p
          SET quantity = GREATEST(0, p.quantity - oi.quantity)
          FROM order_items oi
          WHERE oi.order_id = updated_order.id
            AND oi.product_id = p.id;

          UPDATE product_variants pv
          SET quantity = GREATEST(0, pv.quantity - oi.quantity)
          FROM order_items oi
          WHERE oi.order_id = updated_order.id
            AND oi.product_id = pv.product_id
            AND oi.variant_name IS NOT NULL
            AND oi.variant_name = pv.name;
            
          UPDATE orders 
          SET metadata = metadata || '{"stock_reduced": true}'::jsonb
          WHERE id = updated_order.id;
      END IF;
  ELSE
      SELECT * INTO updated_order FROM orders WHERE order_number = order_ref;
  END IF;

  RETURN to_jsonb(updated_order);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.mark_order_paid(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_order_paid(text, text) TO authenticated, service_role;

-- 2) Unused customer-PII harvesters: server-only.
REVOKE EXECUTE ON FUNCTION public.get_all_customer_emails() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_customer_emails() TO service_role;
REVOKE EXECUTE ON FUNCTION public.get_all_customer_phones() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_customer_phones() TO service_role;

-- 3) Server-only / internal data-mutating functions.
REVOKE EXECUTE ON FUNCTION public.update_customer_stats(text, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_customer_stats(text, numeric) TO service_role;
REVOKE EXECUTE ON FUNCTION public.reduce_stock_on_order(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reduce_stock_on_order(uuid) TO service_role;

-- 4) Trigger-only functions are not meant to be called via the public API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_product_rating_stats() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_role_self_escalation() FROM PUBLIC, anon, authenticated;
