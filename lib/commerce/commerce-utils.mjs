import crypto from 'node:crypto';

export function commerceError(code, message, status = 400, retryable = false) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  error.retryable = retryable;
  return error;
}

export function normalizeEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw commerceError('INVALID_EMAIL', 'A valid email address is required for delivery.', 400);
  }
  return email;
}

export function validateIdempotencyKey(value) {
  const key = String(value || '').trim();
  if (!/^[A-Za-z0-9._:-]{8,80}$/.test(key)) {
    throw commerceError('INVALID_IDEMPOTENCY_KEY', 'Use an idempotency key with 8 to 80 letters, numbers, dots, underscores, colons, or hyphens.', 400);
  }
  return key;
}

export function hashValue(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function constantTimeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createOpaqueId(prefix) {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '')}`;
}

export function siteOrigin(fallback = 'https://cognistration.com') {
  return String(process.env.NEXT_PUBLIC_SITE_URL || fallback).replace(/\/$/, '');
}

export function isMissingTableError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === '42P01'
    || error?.code === 'PGRST205'
    || message.includes('does not exist')
    || message.includes('could not find the table');
}

export function safeCommerceError(error, fallback = 'The commerce request could not be completed.') {
  if (error?.name === 'ZodError') {
    return { code: 'INVALID_INPUT', message: 'The commerce request did not match the published input contract.', retryable: false };
  }
  if (error?.code && Number.isInteger(error?.status) && error.status < 500) {
    return { code: error.code, message: error.message, retryable: Boolean(error.retryable) };
  }
  return {
    code: error?.status >= 500 ? 'COMMERCE_UNAVAILABLE' : 'COMMERCE_REQUEST_FAILED',
    message: fallback,
    retryable: error?.status >= 500 || Boolean(error?.retryable)
  };
}

export function safeCommerceStatus(error, fallback = 500) {
  if (error?.name === 'ZodError') return 400;
  return Number.isInteger(error?.status) && error.status >= 400 && error.status <= 599
    ? error.status
    : fallback;
}

export function stripeVerificationError(error, fallback = 'Payment verification is temporarily unavailable. Please retry shortly.') {
  const providerStatus = Number(error?.statusCode || error?.status);
  if (error?.type === 'StripeInvalidRequestError' || providerStatus === 404) {
    return commerceError('PAYMENT_NOT_VERIFIED', 'That checkout session could not be verified.', 403);
  }
  return commerceError('STRIPE_UNAVAILABLE', fallback, 503, true);
}
