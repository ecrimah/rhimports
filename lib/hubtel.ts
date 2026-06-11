/**
 * Hubtel Online Checkout API client.
 * No SDK — uses fetch + HTTP Basic auth.
 */

const HUBTEL_INITIATE_URL = 'https://payproxyapi.hubtel.com/items/initiate';

export interface HubtelInitiateParams {
  totalAmount: number;
  description: string;
  callbackUrl: string;
  returnUrl: string;
  cancellationUrl: string;
  clientReference: string;
  payeeName?: string;
  payeeMobileNumber?: string;
  payeeEmail?: string;
}

export interface HubtelInitiateResult {
  checkoutUrl: string;
  checkoutId?: string;
  raw: Record<string, unknown>;
}

export interface HubtelTransactionStatus {
  status: string;
  amount?: number;
  charges?: number;
  amountAfterCharges?: number;
  checkoutId?: string;
  clientReference?: string;
  raw: Record<string, unknown>;
}

function getHubtelCredentials(): { apiId: string; apiKey: string; merchantAccount: string } | null {
  const apiId = process.env.HUBTEL_API_ID?.trim();
  const apiKey = process.env.HUBTEL_API_KEY?.trim();
  const merchantAccount = process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER?.trim();
  if (!apiId || !apiKey || !merchantAccount) return null;
  return { apiId, apiKey, merchantAccount };
}

function basicAuthHeader(apiId: string, apiKey: string): string {
  const token = Buffer.from(`${apiId}:${apiKey}`).toString('base64');
  return `Basic ${token}`;
}

/** Hubtel hard-limits clientReference to 32 chars. Retries get a fresh suffix. */
export function makeHubtelClientReference(orderRef: string): string {
  const suffix = `-r${Date.now().toString(36)}`;
  const maxBaseLen = Math.max(1, 32 - suffix.length);
  const base = orderRef.slice(0, maxBaseLen);
  return `${base}${suffix}`.slice(0, 32);
}

/** Strip trailing `-r<timestamp>` so callbacks recover the order number. */
export function stripHubtelReferenceSuffix(ref: string): string {
  return ref.replace(/-r[a-z0-9]+$/i, '');
}

/** True only when Hubtel's transaction status indicates payment succeeded. */
export function isHubtelPaid(status: string | null | undefined): boolean {
  if (!status) return false;
  const s = status.toLowerCase().trim();
  return ['paid', 'success', 'successful', 'completed'].includes(s);
}

/** True when status or response code indicates failure/cancellation. */
export function isHubtelFailure(status: string | null | undefined, responseCode?: string | null): boolean {
  const failCodes = ['2001', '4000', '4070'];
  if (responseCode && failCodes.includes(String(responseCode))) return true;
  if (!status) return false;
  const s = status.toLowerCase().trim();
  return ['failed', 'declined', 'cancelled', 'canceled', 'error', 'unsuccessful'].includes(s);
}

/** Normalize Ghana phone numbers to 233XXXXXXXXX (no leading +). */
export function normalizeGhPhone(input: string | null | undefined): string {
  if (!input) return '';
  let cleaned = input.replace(/\D/g, '');
  if (cleaned.startsWith('0')) cleaned = '233' + cleaned.slice(1);
  if (cleaned.length === 9) cleaned = '233' + cleaned;
  return cleaned;
}

function pickString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && !Number.isNaN(v)) return String(v);
  }
  return '';
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const v of values) {
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
}

/** Normalize RMSC status payload (PascalCase, Data may be array) into camelCase. */
export function normalizeHubtelStatusPayload(payload: Record<string, unknown>): HubtelTransactionStatus {
  const dataRaw = payload.Data ?? payload.data;
  const data: Record<string, unknown> = Array.isArray(dataRaw)
    ? ((dataRaw[0] as Record<string, unknown>) || {})
    : ((dataRaw as Record<string, unknown>) || {});

  const status = pickString(
    data.TransactionStatus,
    data.InvoiceStatus,
    data.Status,
    data.status,
    payload.Status,
    payload.status
  );

  return {
    status,
    amount: pickNumber(data.TransactionAmount, data.Amount, data.amount),
    charges: pickNumber(data.Fee, data.Charges, data.charges),
    amountAfterCharges: pickNumber(data.AmountAfterFees, data.AmountAfterCharges, data.amountAfterCharges),
    checkoutId: pickString(data.CheckoutId, data.checkoutId),
    clientReference: pickString(data.ClientReference, data.clientReference),
    raw: { ...payload, _normalizedData: data },
  };
}

/** Start a hosted-checkout session. */
export async function hubtelInitiateCheckout(params: HubtelInitiateParams): Promise<HubtelInitiateResult> {
  const creds = getHubtelCredentials();
  if (!creds) throw new Error('Hubtel credentials not configured');

  const body = {
    totalAmount: params.totalAmount,
    description: params.description,
    callbackUrl: params.callbackUrl,
    returnUrl: params.returnUrl,
    cancellationUrl: params.cancellationUrl,
    merchantAccountNumber: creds.merchantAccount,
    clientReference: params.clientReference,
    ...(params.payeeName ? { payeeName: params.payeeName } : {}),
    ...(params.payeeMobileNumber ? { payeeMobileNumber: params.payeeMobileNumber } : {}),
    ...(params.payeeEmail ? { payeeEmail: params.payeeEmail } : {}),
  };

  const res = await fetch(HUBTEL_INITIATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: basicAuthHeader(creds.apiId, creds.apiKey),
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const data = (json.data ?? json.Data ?? json) as Record<string, unknown>;

  const checkoutUrl = pickString(
    data.checkoutUrl,
    data.checkoutDirectUrl,
    data.CheckoutUrl,
    data.CheckoutDirectUrl
  );

  if (!checkoutUrl) {
    const msg = pickString(json.message, json.Message, json.statusMessage) || 'No checkout URL returned';
    throw new Error(msg);
  }

  return {
    checkoutUrl,
    checkoutId: pickString(data.checkoutId, data.CheckoutId) || undefined,
    raw: json,
  };
}

/** Re-query transaction status via the public RMSC endpoint (no IP whitelist). */
export async function hubtelCheckTransactionStatus(clientReference: string): Promise<HubtelTransactionStatus> {
  const creds = getHubtelCredentials();
  if (!creds) throw new Error('Hubtel credentials not configured');

  const url = new URL(
    `https://rmsc.hubtel.com/v1/merchantaccount/merchants/${encodeURIComponent(creds.merchantAccount)}/transactions/status`
  );
  url.searchParams.set('clientReference', clientReference);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: basicAuthHeader(creds.apiId, creds.apiKey),
      Accept: 'application/json',
    },
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return normalizeHubtelStatusPayload(json);
}

export function hubtelCredentialsConfigured(): boolean {
  return getHubtelCredentials() !== null;
}
