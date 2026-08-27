import crypto from 'node:crypto';
import Stripe from 'stripe';
import { z } from 'zod';
import {
  WORKSHOP_ACCESS_DURATION_HOURS,
  WORKSHOP_PRICE_ID,
  WORKSHOP_SESSION_DURATION_SEC
} from '../billing/plans.js';
import { getSupabaseAdmin } from '../supabase/admin.js';
import {
  commerceError,
  isMissingTableError,
  normalizeEmail,
  siteOrigin
} from './commerce-utils.mjs';

export const WorkshopAccessKeyInputSchema = z.object({
  accessKey: z.string().trim().min(20).max(200)
}).strict();

function secretForKeys(secret) {
  const value = secret || process.env.WORKSHOP_ACCESS_KEY_SECRET || process.env.STRIPE_SECRET_KEY;
  if (!value) throw commerceError('WORKSHOP_KEY_SECRET_MISSING', 'Workshop access is not configured yet.', 503, true);
  return String(value);
}

function keyMaterial(secret) {
  return crypto.createHash('sha256').update(`cognistration-workshop-key-v1:${secretForKeys(secret)}`).digest();
}

export function hashWorkshopAccessKey(accessKey, secret) {
  return crypto.createHmac('sha256', keyMaterial(secret)).update(String(accessKey)).digest('hex');
}

export function encryptWorkshopAccessKey(accessKey, secret, randomBytes = crypto.randomBytes) {
  const iv = randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyMaterial(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(String(accessKey), 'utf8'), cipher.final()]);
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function decryptWorkshopAccessKey(ciphertext, secret) {
  const [ivEncoded, tagEncoded, dataEncoded] = String(ciphertext || '').split('.');
  if (!ivEncoded || !tagEncoded || !dataEncoded) throw new Error('Workshop access key ciphertext is invalid');
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyMaterial(secret), Buffer.from(ivEncoded, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagEncoded, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataEncoded, 'base64url')),
    decipher.final()
  ]).toString('utf8');
}

export function createWorkshopAccessKey(randomBytes = crypto.randomBytes) {
  return `cgws_${randomBytes(32).toString('base64url')}`;
}

function stripeClient(stripe) {
  if (stripe) return stripe;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw commerceError('STRIPE_NOT_CONFIGURED', 'Stripe access verification is not configured yet.', 503, true);
  return new Stripe(secret);
}

function sessionEmail(stripeSession) {
  return String(
    stripeSession?.customer_details?.email
      || stripeSession?.customer_email
      || stripeSession?.metadata?.purchaserEmail
      || ''
  ).trim().toLowerCase();
}

function assertPaidWorkshopSession(stripeSession) {
  if (stripeSession?.metadata?.productType !== 'workshop-24h') {
    throw commerceError('INVALID_WORKSHOP_SESSION', 'That checkout session is not a Cognistration workshop purchase.', 400);
  }
  if (stripeSession.payment_status && stripeSession.payment_status !== 'paid') {
    throw commerceError('PAYMENT_NOT_VERIFIED', 'The workshop payment has not completed.', 403);
  }
  if (!stripeSession?.id) throw commerceError('INVALID_WORKSHOP_SESSION', 'The workshop checkout reference is missing.', 400);
}

function publicAccess({ row, accessKey, origin = siteOrigin() }) {
  return {
    accessKeyHint: row.access_key_hint,
    status: row.status,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    sessionDurationSec: WORKSHOP_SESSION_DURATION_SEC,
    sessionDurationLabel: 'Up to 60 minutes per workshop session',
    ...(row.status === 'active' ? {
      accessKey,
      accessUrl: `${origin}/machine#workshop=${encodeURIComponent(accessKey)}`
    } : {})
  };
}

async function assertIssueableAccess(admin, row, now = new Date()) {
  if (row?.status !== 'active') {
    throw commerceError('WORKSHOP_ACCESS_NOT_ACTIVE', 'This workshop access is no longer active.', 403);
  }

  const expiresAt = Date.parse(row.expires_at || '');
  if (!Number.isFinite(expiresAt) || expiresAt <= now.getTime()) {
    await admin
      .from('workshop_access_keys')
      .update({ status: 'expired', updated_at: now.toISOString() })
      .eq('id', row.id)
      .eq('status', 'active');
    throw commerceError('WORKSHOP_ACCESS_EXPIRED', 'This workshop access has expired.', 403);
  }
}

async function readByStripeSession(supabase, sessionId) {
  const { data, error } = await supabase
    .from('workshop_access_keys')
    .select('id,access_key_hash,access_key_hint,access_key_ciphertext,status,starts_at,expires_at,stripe_session_id')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) throw commerceError('WORKSHOP_STORAGE_NOT_READY', 'Workshop access storage is not ready yet.', 503, true);
    throw error;
  }
  return data || null;
}

async function readByHash(supabase, accessKeyHash) {
  const { data, error } = await supabase
    .from('workshop_access_keys')
    .select('id,access_key_hash,access_key_hint,status,starts_at,expires_at,use_count')
    .eq('access_key_hash', accessKeyHash)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) throw commerceError('WORKSHOP_STORAGE_NOT_READY', 'Workshop access storage is not ready yet.', 503, true);
    throw error;
  }
  return data || null;
}

export async function issueWorkshopAccessKey({ stripeSession, supabase, origin = siteOrigin(), secret, randomBytes } = {}) {
  assertPaidWorkshopSession(stripeSession);
  const email = normalizeEmail(sessionEmail(stripeSession));
  const admin = supabase || getSupabaseAdmin();
  if (!admin) throw commerceError('WORKSHOP_STORAGE_NOT_READY', 'Workshop access storage is not available.', 503, true);
  const keySecret = secretForKeys(secret);

  const existing = await readByStripeSession(admin, stripeSession.id);
  if (existing) {
    await assertIssueableAccess(admin, existing);
    const accessKey = decryptWorkshopAccessKey(existing.access_key_ciphertext, keySecret);
    return publicAccess({ row: existing, accessKey, origin });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + WORKSHOP_ACCESS_DURATION_HOURS * 60 * 60 * 1000);
  const accessKey = createWorkshopAccessKey(randomBytes);
  const record = {
    access_key_hash: hashWorkshopAccessKey(accessKey, keySecret),
    access_key_hint: accessKey.slice(0, 12),
    access_key_ciphertext: encryptWorkshopAccessKey(accessKey, keySecret, randomBytes),
    user_id: stripeSession.client_reference_id || stripeSession.metadata?.user_uuid || null,
    purchaser_email: email,
    stripe_session_id: stripeSession.id,
    stripe_customer_id: typeof stripeSession.customer === 'string' ? stripeSession.customer : null,
    stripe_payment_intent_id: typeof stripeSession.payment_intent === 'string' ? stripeSession.payment_intent : null,
    price_id: stripeSession.metadata?.priceId || WORKSHOP_PRICE_ID || '',
    status: 'active',
    starts_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    metadata: {
      productType: 'workshop-24h',
      durationHours: WORKSHOP_ACCESS_DURATION_HOURS,
      sessionDurationSec: WORKSHOP_SESSION_DURATION_SEC,
      source: stripeSession.metadata?.source || 'stripe-checkout'
    }
  };

  const { data: saved, error } = await admin
    .from('workshop_access_keys')
    .insert(record)
    .select('id,access_key_hash,access_key_hint,access_key_ciphertext,status,starts_at,expires_at,stripe_session_id')
    .single();
  if (error) {
    const raced = await readByStripeSession(admin, stripeSession.id);
    if (raced) {
      await assertIssueableAccess(admin, raced);
      const racedKey = decryptWorkshopAccessKey(raced.access_key_ciphertext, keySecret);
      return publicAccess({ row: raced, accessKey: racedKey, origin });
    }
    throw error;
  }

  return publicAccess({ row: saved, accessKey, origin });
}

export async function getWorkshopAccessForSession({ sessionId, supabase, stripe, origin = siteOrigin(), secret } = {}) {
  const id = String(sessionId || '').trim();
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) throw commerceError('INVALID_CHECKOUT_SESSION', 'A valid workshop checkout reference is required.', 400);
  const session = await stripeClient(stripe).checkout.sessions.retrieve(id);
  assertPaidWorkshopSession(session);
  return issueWorkshopAccessKey({ stripeSession: session, supabase, origin, secret });
}

export async function validateWorkshopAccessKey({ input, supabase, now = new Date(), secret } = {}) {
  const parsed = WorkshopAccessKeyInputSchema.parse(input || {});
  const admin = supabase || getSupabaseAdmin();
  if (!admin) throw commerceError('WORKSHOP_STORAGE_NOT_READY', 'Workshop access storage is not available.', 503, true);
  const row = await readByHash(admin, hashWorkshopAccessKey(parsed.accessKey, secret));
  if (!row) return { valid: false, status: 'invalid' };

  if (row.status === 'active' && new Date(row.expires_at).getTime() <= now.getTime()) {
    await admin.from('workshop_access_keys').update({ status: 'expired', updated_at: now.toISOString() }).eq('id', row.id);
    return { valid: false, status: 'expired', expiresAt: row.expires_at, accessKeyHint: row.access_key_hint };
  }

  if (row.status !== 'active') {
    return { valid: false, status: row.status, expiresAt: row.expires_at, accessKeyHint: row.access_key_hint };
  }

  await admin.from('workshop_access_keys').update({
    last_used_at: now.toISOString(),
    use_count: Number(row.use_count || 0) + 1,
    updated_at: now.toISOString()
  }).eq('id', row.id);

  return {
    valid: true,
    status: 'active',
    accessKeyHint: row.access_key_hint,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    sessionDurationSec: WORKSHOP_SESSION_DURATION_SEC,
    sessionDurationLabel: 'Up to 60 minutes per workshop session'
  };
}

export async function revokeWorkshopAccess({ input, supabase, now = new Date(), reason = 'user_requested', secret } = {}) {
  const parsed = WorkshopAccessKeyInputSchema.parse(input || {});
  const admin = supabase || getSupabaseAdmin();
  if (!admin) throw commerceError('WORKSHOP_STORAGE_NOT_READY', 'Workshop access storage is not available.', 503, true);
  const row = await readByHash(admin, hashWorkshopAccessKey(parsed.accessKey, secret));
  if (!row) throw commerceError('NOT_FOUND', 'That workshop access key was not found.', 404);
  if (row.status === 'revoked') return { revoked: true, status: 'revoked', accessKeyHint: row.access_key_hint };

  const { error } = await admin.from('workshop_access_keys').update({
    status: 'revoked',
    revoked_at: now.toISOString(),
    revoked_reason: String(reason).slice(0, 120),
    updated_at: now.toISOString()
  }).eq('id', row.id).eq('status', 'active');
  if (error) throw error;
  return { revoked: true, status: 'revoked', accessKeyHint: row.access_key_hint };
}

export async function revokeWorkshopAccessForPayment({ paymentIntentId, supabase, now = new Date(), reason = 'payment_refunded' } = {}) {
  const id = String(paymentIntentId || '').trim();
  if (!id) return { revoked: false, matched: 0 };
  const admin = supabase || getSupabaseAdmin();
  if (!admin) throw commerceError('WORKSHOP_STORAGE_NOT_READY', 'Workshop access storage is not available.', 503, true);
  const { data, error } = await admin
    .from('workshop_access_keys')
    .update({
      status: 'revoked',
      revoked_at: now.toISOString(),
      revoked_reason: String(reason).slice(0, 120),
      updated_at: now.toISOString()
    })
    .eq('stripe_payment_intent_id', id)
    .eq('status', 'active')
    .select('id');
  if (error) {
    if (isMissingTableError(error)) throw commerceError('WORKSHOP_STORAGE_NOT_READY', 'Workshop access storage is not ready yet.', 503, true);
    throw error;
  }
  return { revoked: Boolean(data?.length), matched: data?.length || 0 };
}

export function workshopAccessPolicy(origin = siteOrigin()) {
  return {
    price: '$2.99',
    billingMode: 'one-time purchase',
    duration: '24 hours',
    sessionLimit: 'up to 60 minutes per machine workshop session',
    checkoutUrl: `${origin}/pricing#machine-workshop`,
    accessUrl: `${origin}/machine`,
    revocable: true,
    credentialsAcceptedByPublicMcp: false,
    paymentCredentialsAcceptedByPublicMcp: false
  };
}
