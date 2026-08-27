import crypto from 'node:crypto';

function signature(body, timestamp, secret) {
  return crypto.createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('base64');
}

export async function notifyUcpOrderEvent({ event, order, checkout, fetchImpl = fetch } = {}) {
  const endpoint = String(process.env.UCP_ORDER_WEBHOOK_URL || '').trim();
  const secret = String(process.env.UCP_WEBHOOK_SECRET || '').trim();
  if (!endpoint || !secret) return { sent: false, skipped: true, reason: 'UCP order webhook is not configured.' };

  const payload = JSON.stringify({
    event,
    order: {
      id: order?.id,
      status: order?.status,
      checkout_id: order?.checkout_id,
      updated_at: order?.updated_at || new Date().toISOString()
    },
    checkout: checkout ? { id: checkout.id, status: checkout.status } : undefined
  });
  const timestamp = new Date().toISOString();
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ucp-event': event,
      'x-ucp-timestamp': timestamp,
      'x-ucp-signature': signature(payload, timestamp, secret)
    },
    body: payload,
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) return { sent: false, reason: `UCP webhook returned ${response.status}` };
  return { sent: true };
}

export function verifyUcpWebhookSignature({ rawBody, timestamp, provided, secret, now = Date.now() } = {}) {
  if (!rawBody || !timestamp || !provided || !secret) return false;
  const timestampMs = Date.parse(timestamp);
  if (!Number.isFinite(timestampMs) || Math.abs(now - timestampMs) > 5 * 60 * 1000) return false;
  const expected = signature(rawBody, timestamp, secret);
  const left = Buffer.from(expected);
  const right = Buffer.from(String(provided));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
