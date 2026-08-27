import crypto from 'node:crypto';
import { commerceError, constantTimeEqual } from './commerce-utils.mjs';

const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000;

function bearerToken(request) {
  const value = request.headers.get('authorization') || '';
  return value.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || '';
}

function signatureValue(request) {
  return request.headers.get('x-ucp-signature')
    || request.headers.get('x-cognistration-signature')
    || request.headers.get('request-signature')
    || '';
}

function timestampValue(request) {
  return request.headers.get('x-ucp-timestamp')
    || request.headers.get('x-cognistration-timestamp')
    || request.headers.get('request-timestamp')
    || '';
}

export function verifyRequestSignature({ rawBody, timestamp, provided, secret, now = Date.now() }) {
  if (rawBody == null || !timestamp || !provided || !secret) return false;
  const timestampMs = Date.parse(timestamp);
  if (!Number.isFinite(timestampMs) || Math.abs(now - timestampMs) > MAX_SIGNATURE_AGE_MS) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('base64');
  const normalized = String(provided).replace(/^sha256=/i, '');
  return constantTimeEqual(expected, normalized);
}

function parseProfileHeader(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const quoted = raw.match(/(?:^|,\s*)profile\s*=\s*"([^"]+)"/i)?.[1];
  return (quoted || raw).trim();
}

function validProfileUrl(profile) {
  try {
    const url = new URL(profile);
    if (!['https:', 'http:'].includes(url.protocol)) return false;
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') return false;
    return true;
  } catch {
    return false;
  }
}

export function assertUcpAgentProfile({ meta, request } = {}) {
  const metadataProfile = String(meta?.['ucp-agent']?.profile || '').trim();
  const headerProfile = parseProfileHeader(request?.headers?.get('UCP-Agent'));
  const profile = metadataProfile || headerProfile;
  if (!profile || !validProfileUrl(profile)) {
    throw commerceError('UCP_AGENT_REQUIRED', 'The UCP request must identify the agent profile with a valid HTTPS profile URL.', 400);
  }
  if (metadataProfile && headerProfile && metadataProfile !== headerProfile) {
    throw commerceError('UCP_AGENT_MISMATCH', 'The UCP agent profile in request metadata does not match the UCP-Agent header.', 400);
  }
  return { profile };
}

export function authorizeUcpRequest(request, rawBody = '', options = {}) {
  const configuredToken = String(process.env.UCP_API_TOKEN || '').trim();
  if (configuredToken) {
    const provided = bearerToken(request);
    if (!provided || !constantTimeEqual(provided, configuredToken)) {
      throw commerceError('UCP_UNAUTHORIZED', 'This commerce endpoint requires an authorized UCP connection.', 401, true);
    }
  }

  const configuredSecret = String(process.env.UCP_SHARED_SECRET || '').trim();
  if (configuredSecret) {
    if (!verifyRequestSignature({
      rawBody,
      timestamp: timestampValue(request),
      provided: signatureValue(request),
      secret: configuredSecret
    })) {
      throw commerceError('UCP_SIGNATURE_INVALID', 'The UCP request signature is missing, expired, or invalid.', 401, true);
    }
  }

  const result = { authorized: true, tokenRequired: Boolean(configuredToken), signatureRequired: Boolean(configuredSecret) };
  if (options.requireAgentProfile) {
    result.agent = assertUcpAgentProfile({ meta: options.meta, request });
  }
  return result;
}

export function idempotencyKeyFrom(request, body) {
  const header = request.headers.get('idempotency-key') || request.headers.get('x-idempotency-key');
  const metadata = body?.meta
    || body?._meta
    || body?.arguments?.meta
    || body?.arguments?._meta
    || body?.params?.meta
    || body?.params?._meta
    || body?.params?.arguments?.meta
    || body?.params?.arguments?._meta;
  return String(header || metadata?.['idempotency-key'] || metadata?.idempotency_key || '').trim();
}

export function parseJsonBody(rawBody) {
  try {
    return JSON.parse(rawBody || '{}');
  } catch {
    throw commerceError('INVALID_JSON', 'The UCP request body must be valid JSON.', 400);
  }
}

export function ucpSecurityError(error) {
  const validationError = error?.name === 'ZodError';
  const publicError = error?.code && Number.isInteger(error?.status) && error.status < 500;
  return {
    code: publicError ? error.code : (validationError ? 'INVALID_INPUT' : 'UCP_REQUEST_FAILED'),
    message: publicError ? error.message : (validationError ? 'The UCP request did not match the published checkout contract.' : 'The UCP commerce service is temporarily unavailable.'),
    retryable: Boolean(error?.retryable || error?.status >= 500)
  };
}
