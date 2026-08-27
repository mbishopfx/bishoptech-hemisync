import crypto from 'node:crypto';
import { z } from 'zod';
import { WORKSHOP_SESSION_DURATION_SEC } from '../billing/plans.js';
import { getSupabaseAdmin } from '../supabase/admin.js';
import {
  commerceError,
  isMissingTableError,
  siteOrigin
} from './commerce-utils.mjs';

export const MACHINE_SESSION_GRANT_DURATION_SEC = WORKSHOP_SESSION_DURATION_SEC;

export const MachineSessionGrantInputSchema = z.object({
  accessKey: z.string().trim().min(20).max(200)
}).strict();

function secretForGrants(secret) {
  const value = secret
    || process.env.MACHINE_PAYMENT_GRANT_SECRET
    || process.env.MPP_SECRET_KEY
    || process.env.STRIPE_SECRET_KEY;
  if (!value) throw commerceError('MACHINE_GRANT_SECRET_MISSING', 'Machine session access is not configured yet.', 503, true);
  return String(value);
}

function keyMaterial(secret) {
  return crypto.createHash('sha256').update(`cognistration-machine-session-grant-v1:${secretForGrants(secret)}`).digest();
}

export function hashMachineSessionGrant(accessKey, secret) {
  return crypto.createHmac('sha256', keyMaterial(secret)).update(String(accessKey)).digest('hex');
}

export function encryptMachineSessionGrant(accessKey, secret, randomBytes = crypto.randomBytes) {
  const iv = randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyMaterial(secret), iv);
  const ciphertext = Buffer.concat([cipher.update(String(accessKey), 'utf8'), cipher.final()]);
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function decryptMachineSessionGrant(ciphertext, secret) {
  const [ivEncoded, tagEncoded, dataEncoded] = String(ciphertext || '').split('.');
  if (!ivEncoded || !tagEncoded || !dataEncoded) throw new Error('Machine session grant ciphertext is invalid');
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyMaterial(secret), Buffer.from(ivEncoded, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagEncoded, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataEncoded, 'base64url')),
    decipher.final()
  ]).toString('utf8');
}

export function createMachineSessionGrant(randomBytes = crypto.randomBytes) {
  return `cgms_${randomBytes(32).toString('base64url')}`;
}

function receiptReference(receipt) {
  const reference = String(receipt?.reference || '').trim();
  if (!reference || reference.length > 240) {
    throw commerceError('MACHINE_PAYMENT_RECEIPT_MISSING', 'The verified machine payment receipt is incomplete.', 502, true);
  }
  if (receipt?.status !== 'success') {
    throw commerceError('MACHINE_PAYMENT_RECEIPT_INVALID', 'The machine payment receipt could not be verified.', 402, true);
  }
  return reference;
}

function publicGrant({ row, accessKey, origin = siteOrigin() }) {
  return {
    accessKey,
    accessKeyHint: row.access_key_hint,
    accessType: 'machine_payment',
    status: row.status,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    sessionDurationSec: MACHINE_SESSION_GRANT_DURATION_SEC,
    sessionDurationLabel: 'Up to 60 minutes for this machine session',
    accessUrl: `${origin}/machine#machine=${encodeURIComponent(accessKey)}`
  };
}

async function readByPaymentReference(supabase, paymentReference) {
  const { data, error } = await supabase
    .from('machine_session_grants')
    .select('id,access_key_hash,access_key_hint,access_key_ciphertext,payment_reference,status,starts_at,expires_at')
    .eq('payment_reference', paymentReference)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) throw commerceError('MACHINE_PAYMENT_STORAGE_NOT_READY', 'Machine payment storage is not ready yet.', 503, true);
    throw error;
  }
  return data || null;
}

async function readByHash(supabase, accessKeyHash) {
  const { data, error } = await supabase
    .from('machine_session_grants')
    .select('id,access_key_hash,access_key_hint,status,starts_at,expires_at,use_count')
    .eq('access_key_hash', accessKeyHash)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) throw commerceError('MACHINE_PAYMENT_STORAGE_NOT_READY', 'Machine payment storage is not ready yet.', 503, true);
    throw error;
  }
  return data || null;
}

export async function issueMachineSessionGrant({ receipt, supabase, origin = siteOrigin(), secret, randomBytes, scope = 'cognistration-machine-session-v1' } = {}) {
  const paymentReference = receiptReference(receipt);
  const admin = supabase || getSupabaseAdmin();
  if (!admin) throw commerceError('MACHINE_PAYMENT_STORAGE_NOT_READY', 'Machine payment storage is not available.', 503, true);
  const grantSecret = secretForGrants(secret);
  const grantScope = String(scope || 'cognistration-machine-session-v1').trim().slice(0, 120);
  if (!grantScope) throw commerceError('MACHINE_PAYMENT_SCOPE_INVALID', 'Machine payment scope is not configured.', 500, true);

  const existing = await readByPaymentReference(admin, paymentReference);
  if (existing) {
    const accessKey = decryptMachineSessionGrant(existing.access_key_ciphertext, grantSecret);
    return publicGrant({ row: existing, accessKey, origin });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + MACHINE_SESSION_GRANT_DURATION_SEC * 1000);
  const accessKey = createMachineSessionGrant(randomBytes);
  const record = {
    access_key_hash: hashMachineSessionGrant(accessKey, grantSecret),
    access_key_hint: accessKey.slice(0, 12),
    access_key_ciphertext: encryptMachineSessionGrant(accessKey, grantSecret, randomBytes),
    payment_reference: paymentReference,
    payment_method: String(receipt.method || 'stripe').slice(0, 80),
    scope: grantScope,
    status: 'active',
    starts_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    metadata: {
      paymentStatus: 'success',
      receiptTimestamp: String(receipt.timestamp || '').slice(0, 80),
      sessionDurationSec: MACHINE_SESSION_GRANT_DURATION_SEC
    }
  };

  const { data: saved, error } = await admin
    .from('machine_session_grants')
    .insert(record)
    .select('id,access_key_hash,access_key_hint,access_key_ciphertext,payment_reference,status,starts_at,expires_at')
    .single();
  if (error) {
    const raced = await readByPaymentReference(admin, paymentReference);
    if (raced) {
      const racedKey = decryptMachineSessionGrant(raced.access_key_ciphertext, grantSecret);
      return publicGrant({ row: raced, accessKey: racedKey, origin });
    }
    throw error;
  }

  return publicGrant({ row: saved, accessKey, origin });
}

export async function validateMachineSessionGrant({ input, supabase, now = new Date(), secret } = {}) {
  const parsed = MachineSessionGrantInputSchema.parse(input || {});
  const admin = supabase || getSupabaseAdmin();
  if (!admin) throw commerceError('MACHINE_PAYMENT_STORAGE_NOT_READY', 'Machine payment storage is not available.', 503, true);
  const row = await readByHash(admin, hashMachineSessionGrant(parsed.accessKey, secret));
  if (!row) return { valid: false, status: 'invalid', accessType: 'machine_payment' };

  if (row.status === 'active' && new Date(row.expires_at).getTime() <= now.getTime()) {
    await admin.from('machine_session_grants').update({ status: 'expired', updated_at: now.toISOString() }).eq('id', row.id);
    return { valid: false, status: 'expired', accessType: 'machine_payment', expiresAt: row.expires_at, accessKeyHint: row.access_key_hint };
  }

  if (row.status !== 'active') {
    return { valid: false, status: row.status, accessType: 'machine_payment', expiresAt: row.expires_at, accessKeyHint: row.access_key_hint };
  }

  await admin.from('machine_session_grants').update({
    last_used_at: now.toISOString(),
    use_count: Number(row.use_count || 0) + 1,
    updated_at: now.toISOString()
  }).eq('id', row.id);

  return {
    valid: true,
    status: 'active',
    accessType: 'machine_payment',
    accessKeyHint: row.access_key_hint,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    sessionDurationSec: MACHINE_SESSION_GRANT_DURATION_SEC,
    sessionDurationLabel: 'Up to 60 minutes for this machine session'
  };
}

export async function revokeMachineSessionGrantForPayment({ paymentReference, supabase, now = new Date(), reason = 'payment_refunded' } = {}) {
  const reference = String(paymentReference || '').trim();
  if (!reference) return { revoked: false, matched: 0 };
  const admin = supabase || getSupabaseAdmin();
  if (!admin) throw commerceError('MACHINE_PAYMENT_STORAGE_NOT_READY', 'Machine payment storage is not available.', 503, true);
  const { data, error } = await admin
    .from('machine_session_grants')
    .update({
      status: 'revoked',
      revoked_at: now.toISOString(),
      revoked_reason: String(reason).slice(0, 120),
      updated_at: now.toISOString()
    })
    .eq('payment_reference', reference)
    .eq('status', 'active')
    .select('id');
  if (error) {
    if (isMissingTableError(error)) throw commerceError('MACHINE_PAYMENT_STORAGE_NOT_READY', 'Machine payment storage is not ready yet.', 503, true);
    throw error;
  }
  return { revoked: Boolean(data?.length), matched: data?.length || 0 };
}
