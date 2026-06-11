import type { SupabaseClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '@/lib/notifications';
import { isHubtelPaid } from '@/lib/hubtel';

export interface RemovedItem {
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  reason: string;
}

export interface PrepareOrderResult {
  order: Record<string, any>;
  amount: number;
  removedItems: RemovedItem[];
  repriced: boolean;
}

const ORDER_SELECT = `
  id, order_number, email, phone, status, payment_status,
  subtotal, tax_total, shipping_total, discount_total, total,
  shipping_method, payment_method, shipping_address, metadata
`;

export async function findOrderByRef(supabase: SupabaseClient, orderRef: string) {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderRef);
  if (isUUID) {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', orderRef)
      .maybeSingle();
    if (data) return { data, error: null };
    if (error && error.code !== 'PGRST116') return { data: null, error };
  }

  return supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('order_number', orderRef)
    .maybeSingle();
}

async function resolveLinePrice(
  supabase: SupabaseClient,
  productId: string,
  variantName: string | null | undefined,
  quantity: number
): Promise<{ unitPrice: number; stock: number; variantId: string | null; inStock: boolean } | null> {
  const { data: product } = await supabase
    .from('products')
    .select('id, price, quantity, status, track_quantity, continue_selling')
    .eq('id', productId)
    .maybeSingle();

  if (!product || product.status !== 'active') return null;

  const canOversell = product.continue_selling === true || product.track_quantity === false;

  if (variantName) {
    const { data: variant } = await supabase
      .from('product_variants')
      .select('id, price, quantity, name')
      .eq('product_id', productId)
      .eq('name', variantName)
      .maybeSingle();

    if (!variant) return null;

    const stock = variant.quantity ?? 0;
    const inStock = canOversell || stock >= quantity;
    return { unitPrice: Number(variant.price), stock, variantId: variant.id, inStock };
  }

  const stock = product.quantity ?? 0;
  const inStock = canOversell || stock >= quantity;
  return { unitPrice: Number(product.price), stock, variantId: null, inStock };
}

/**
 * Re-price order lines from DB, remove out-of-stock items, and sync order totals.
 * Never trusts client-submitted amounts.
 */
export async function prepareOrderForHubtelPayment(
  supabase: SupabaseClient,
  order: Record<string, any>
): Promise<PrepareOrderResult> {
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, product_id, product_name, variant_name, variant_id, quantity, unit_price, total_price, metadata')
    .eq('order_id', order.id);

  if (itemsError) throw new Error(`Failed to load order items: ${itemsError.message}`);
  if (!items || items.length === 0) {
    return { order, amount: roundMoney(Number(order.total)), removedItems: [], repriced: false };
  }

  const removedItems: RemovedItem[] = [];
  const keptItems: typeof items = [];
  let subtotal = 0;
  let repriced = false;

  for (const item of items) {
    const resolved = await resolveLinePrice(supabase, item.product_id, item.variant_name, item.quantity);
    if (!resolved || !resolved.inStock) {
      removedItems.push({
        product_name: item.product_name,
        variant_name: item.variant_name,
        quantity: item.quantity,
        reason: 'Out of stock',
      });
      await supabase.from('order_items').delete().eq('id', item.id);
      continue;
    }

    const unitPrice = resolved.unitPrice;
    const lineTotal = roundMoney(unitPrice * item.quantity);
    subtotal += lineTotal;

    if (
      Math.abs(unitPrice - Number(item.unit_price)) > 0.01 ||
      Math.abs(lineTotal - Number(item.total_price)) > 0.01
    ) {
      repriced = true;
      await supabase
        .from('order_items')
        .update({
          unit_price: unitPrice,
          total_price: lineTotal,
          variant_id: resolved.variantId ?? item.variant_id,
        })
        .eq('id', item.id);
    }

    keptItems.push(item);
  }

  if (keptItems.length === 0) {
    const err = new Error('All items in this order are out of stock');
    (err as any).allOutOfStock = true;
    throw err;
  }

  const shippingTotal = Number(order.shipping_total ?? 0);
  const taxTotal = Number(order.tax_total ?? 0);
  const discountTotal = Number(order.discount_total ?? 0);
  const computedTotal = roundMoney(subtotal + shippingTotal + taxTotal - discountTotal);
  const storedTotal = roundMoney(Number(order.total));

  if (Math.abs(computedTotal - storedTotal) > 0.01 || removedItems.length > 0) {
    repriced = true;
  }

  const metadata = {
    ...(order.metadata || {}),
    ...(repriced
      ? {
          server_repriced_at: new Date().toISOString(),
          client_total_attempted: storedTotal,
        }
      : {}),
    ...(removedItems.length > 0 ? { auto_removed_items: removedItems } : {}),
  };

  const { data: updatedOrder, error: updateError } = await supabase
    .from('orders')
    .update({
      subtotal: roundMoney(subtotal),
      total: computedTotal,
      metadata,
    })
    .eq('id', order.id)
    .select(ORDER_SELECT)
    .single();

  if (updateError || !updatedOrder) {
    throw new Error(updateError?.message || 'Failed to update order totals');
  }

  return {
    order: updatedOrder,
    amount: computedTotal,
    removedItems,
    repriced,
  };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function amountsMatch(expected: number, actual: number, tolerance = 0.01): boolean {
  return Math.abs(roundMoney(expected) - roundMoney(actual)) <= tolerance;
}

export function settlementAmount(status: {
  amountAfterCharges?: number;
  amount?: number;
}): number | undefined {
  const val = status.amountAfterCharges ?? status.amount;
  return val === undefined ? undefined : roundMoney(val);
}

export async function finalizeHubtelPaidOrder(
  supabase: SupabaseClient,
  orderRef: string,
  hubtelRef: string,
  extraMetadata: Record<string, unknown> = {}
): Promise<{ alreadyPaid: boolean; order: Record<string, any> | null }> {
  const { data: existing } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', orderRef)
    .maybeSingle();

  if (!existing) return { alreadyPaid: false, order: null };

  if (existing.payment_status === 'paid') {
    return { alreadyPaid: true, order: existing };
  }

  const { data: orderJson, error: updateError } = await supabase.rpc('mark_order_paid', {
    order_ref: orderRef,
    moolre_ref: hubtelRef,
  });

  if (updateError) throw new Error(updateError.message);
  if (!orderJson) return { alreadyPaid: false, order: null };

  const mergedMetadata = {
    ...(orderJson.metadata || {}),
    payment_gateway: 'hubtel',
    hubtel_reference: hubtelRef,
    hubtel_paid_at: new Date().toISOString(),
    ...extraMetadata,
  };

  await supabase
    .from('orders')
    .update({ metadata: mergedMetadata, payment_method: 'hubtel' })
    .eq('order_number', orderRef);

  const finalOrder = { ...orderJson, metadata: mergedMetadata, payment_method: 'hubtel' };

  if (finalOrder.email) {
    try {
      await supabase.rpc('update_customer_stats', {
        p_customer_email: finalOrder.email,
        p_order_total: finalOrder.total,
      });
    } catch (statsError: any) {
      console.error('[Hubtel] Customer stats failed:', statsError.message);
    }
  }

  try {
    await sendOrderConfirmation(finalOrder);
  } catch (notifyError: any) {
    console.error('[Hubtel] Notification failed:', notifyError.message);
  }

  return { alreadyPaid: false, order: finalOrder };
}

export function hubtelStatusIsPaid(status: string, responseCode?: string | null): boolean {
  // ResponseCode 0000 = request received, NOT payment success
  return isHubtelPaid(status);
}

export function getPayeeName(order: Record<string, any>): string {
  const sa = order.shipping_address || {};
  if (sa.full_name) return sa.full_name;
  const fromShipping = [sa.firstName, sa.lastName].filter(Boolean).join(' ').trim();
  if (fromShipping) return fromShipping;
  const fromMeta = [order.metadata?.first_name, order.metadata?.last_name].filter(Boolean).join(' ').trim();
  return fromMeta || 'Customer';
}

export function isValidOrderNumber(orderNumber: string): boolean {
  return /^ORD-\d+-\d+$/.test(orderNumber);
}

export function isSameOriginRequest(request: Request): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl) return false;

  let appHost: string;
  try {
    appHost = new URL(appUrl).host;
  } catch {
    return false;
  }

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).host === appHost;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).host === appHost;
    } catch {
      return false;
    }
  }

  return false;
}
