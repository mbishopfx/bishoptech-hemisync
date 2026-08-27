import crypto from 'node:crypto';
import { commerceError, hashValue, siteOrigin } from './commerce-utils.mjs';

export const AP2_UCP_CAPABILITY = 'dev.ucp.shopping.ap2_mandate';
export const AP2_UCP_VERSION = '2026-01-23';
export const AP2_UCP_SPEC_URL = 'https://ucp.dev/2026-01-23/specification/ap2-mandates';
export const AP2_UCP_SCHEMA_URL = 'https://ucp.dev/2026-01-23/schemas/shopping/ap2_mandate.json';
export const AP2_PROTOCOL_URL = 'https://ap2-protocol.org/ap2/specification/';
export const AP2_CHECKOUT_MANDATE_URL = 'https://ap2-protocol.org/ap2/checkout_mandate/';
export const AP2_PAYMENT_MANDATE_URL = 'https://ap2-protocol.org/ap2/payment_mandate/';

const MAX_TOKEN_LENGTH = 64 * 1024;
const MAX_CHAIN_DEPTH = 8;
const CLOCK_SKEW_SECONDS = 300;
const PRIVATE_JWK_FIELDS = ['d', 'p', 'q', 'dp', 'dq', 'qi', 'oth', 'k'];
const SUPPORTED_ALGORITHMS = new Map([
  ['P-256', { alg: 'ES256', digest: 'sha256', signatureBytes: 64 }],
  ['P-384', { alg: 'ES384', digest: 'sha384', signatureBytes: 96 }],
  ['P-521', { alg: 'ES512', digest: 'sha512', signatureBytes: 132 }]
]);
const HASH_ALGORITHMS = new Map([
  ['sha-256', 'sha256'],
  ['sha-384', 'sha384'],
  ['sha-512', 'sha512']
]);

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function b64urlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function b64urlDecode(value, label = 'value') {
  const raw = String(value || '');
  if (!raw || !/^[A-Za-z0-9_-]+$/.test(raw) || raw.length % 4 === 1) {
    throw new Error(`Invalid base64url ${label}`);
  }
  return Buffer.from(raw, 'base64url');
}

function decodeJsonSegment(value, label) {
  try {
    const parsed = JSON.parse(b64urlDecode(value, label).toString('utf8'));
    if (!isRecord(parsed)) throw new Error(`${label} must be an object`);
    return parsed;
  } catch (error) {
    throw new Error(`Invalid JWT ${label}: ${error.message}`);
  }
}

function jcsCanonicalize(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('JCS does not allow non-finite numbers');
    return Object.is(value, -0) ? '0' : JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(jcsCanonicalize).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => `${JSON.stringify(key)}:${jcsCanonicalize(value[key])}`).join(',')}}`;
  }
  throw new Error('JCS cannot canonicalize this value');
}

function withoutAp2(checkout) {
  if (!isRecord(checkout)) throw new Error('Checkout must be an object');
  const copy = { ...checkout };
  delete copy.ap2;
  return copy;
}

function readJsonEnv(name) {
  const raw = String(process.env[name] || '').trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.keys)) return parsed.keys;
    return [parsed];
  } catch {
    return [];
  }
}

function validPublicJwk(value) {
  if (!isRecord(value) || PRIVATE_JWK_FIELDS.some((field) => field in value)) return null;
  const profile = SUPPORTED_ALGORITHMS.get(value.crv);
  if (value.kty !== 'EC' || !profile || !value.kid || typeof value.x !== 'string' || typeof value.y !== 'string') return null;
  return { ...value, alg: value.alg || profile.alg };
}

function readPublicJwks(...names) {
  const seen = new Set();
  const keys = [];
  for (const name of names) {
    for (const candidate of readJsonEnv(name)) {
      const key = validPublicJwk(candidate);
      if (!key || seen.has(key.kid)) continue;
      seen.add(key.kid);
      keys.push(key);
    }
  }
  return keys;
}

function readPrivateJwk(name = 'UCP_SIGNING_PRIVATE_JWK', keyIdName = 'UCP_SIGNING_KEY_ID') {
  const candidates = readJsonEnv(name);
  const candidate = candidates[0];
  if (!isRecord(candidate) || typeof candidate.d !== 'string' || !candidate.kty || !candidate.crv) return null;
  const profile = SUPPORTED_ALGORITHMS.get(candidate.crv);
  if (candidate.kty !== 'EC' || !profile || !candidate.x || !candidate.y) return null;
  const kid = String(process.env[keyIdName] || candidate.kid || '').trim();
  if (!kid) return null;
  return { ...candidate, kid, alg: candidate.alg || profile.alg };
}

function signingKeyReady() {
  const privateJwk = readPrivateJwk();
  if (!privateJwk) return false;
  const publicJwk = readPublicJwks('UCP_SIGNING_PUBLIC_JWK').find((key) => key.kid === privateJwk.kid);
  return Boolean(publicJwk && publicJwk.crv === privateJwk.crv);
}

function paymentReceiptSigningKey() {
  return readPrivateJwk('AP2_PAYMENT_RECEIPT_PRIVATE_JWK', 'AP2_PAYMENT_RECEIPT_KEY_ID');
}

function paymentReceiptSigningReady() {
  const privateJwk = paymentReceiptSigningKey();
  if (!privateJwk) return false;
  const publicJwk = readPublicJwks('AP2_PAYMENT_RECEIPT_PUBLIC_JWK').find((key) => key.kid === privateJwk.kid);
  return Boolean(publicJwk && publicJwk.crv === privateJwk.crv);
}

function agentKeys() {
  return readPublicJwks('AP2_AGENT_PUBLIC_JWK', 'AP2_AGENT_PUBLIC_KEYS');
}

function paymentKeys() {
  return readPublicJwks('AP2_PAYMENT_PUBLIC_JWK', 'AP2_PAYMENT_PUBLIC_KEYS');
}

function enabled(name) {
  return String(process.env[name] || '').toLowerCase() === 'true';
}

export function officialAp2Readiness(origin = siteOrigin()) {
  const missing = [];
  if (!enabled('AP2_OFFICIAL_ENABLED')) missing.push('AP2_OFFICIAL_ENABLED=true');
  if (!enabled('AP2_ENABLED')) missing.push('AP2_ENABLED=true');
  if (!enabled('UCP_SHARED_PAYMENT_TOKEN_ENABLED')) missing.push('UCP_SHARED_PAYMENT_TOKEN_ENABLED=true');
  if (!process.env.STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY');
  if (!process.env.STRIPE_NETWORK_ID) missing.push('STRIPE_NETWORK_ID');
  if (!signingKeyReady()) missing.push('matching UCP_SIGNING_PRIVATE_JWK and UCP_SIGNING_PUBLIC_JWK');
  if (!agentKeys().length) missing.push('AP2_AGENT_PUBLIC_JWK or AP2_AGENT_PUBLIC_KEYS');
  if (!paymentKeys().length) missing.push('AP2_PAYMENT_PUBLIC_JWK or AP2_PAYMENT_PUBLIC_KEYS');
  if (!paymentReceiptSigningReady()) missing.push('matching AP2_PAYMENT_RECEIPT_PRIVATE_JWK and AP2_PAYMENT_RECEIPT_PUBLIC_JWK');
  return {
    capability: AP2_UCP_CAPABILITY,
    version: AP2_UCP_VERSION,
    protocol: 'AP2 SD-JWT mandates over UCP checkout',
    specification: AP2_PROTOCOL_URL,
    checkoutMandateSpecification: AP2_CHECKOUT_MANDATE_URL,
    paymentMandateSpecification: AP2_PAYMENT_MANDATE_URL,
    ucpSpecification: AP2_UCP_SPEC_URL,
    ucpSchema: AP2_UCP_SCHEMA_URL,
    status: missing.length ? 'provider_access_required' : 'enabled',
    endpoint: `${origin}/api/ucp/checkout-sessions/{checkoutId}/complete`,
    requiredProductionConfiguration: [
      'AP2_OFFICIAL_ENABLED=true',
      'AP2_ENABLED=true',
      'UCP_SHARED_PAYMENT_TOKEN_ENABLED=true',
      'STRIPE_NETWORK_ID',
      'UCP_SIGNING_PRIVATE_JWK',
      'UCP_SIGNING_PUBLIC_JWK',
      'AP2_AGENT_PUBLIC_JWK (or a registered AP2 agent-key set)',
      'AP2_PAYMENT_PUBLIC_JWK (or a registered payment-provider key set)',
      'AP2_PAYMENT_RECEIPT_PRIVATE_JWK',
      'AP2_PAYMENT_RECEIPT_PUBLIC_JWK'
    ],
    checks: {
      merchantAuthorizationSigning: signingKeyReady(),
      agentSigningKeyRegistry: agentKeys().length > 0,
      paymentSigningKeyRegistry: paymentKeys().length > 0,
      paymentReceiptSigning: paymentReceiptSigningReady(),
      paymentHandler: enabled('UCP_SHARED_PAYMENT_TOKEN_ENABLED') && Boolean(process.env.STRIPE_NETWORK_ID && process.env.STRIPE_SECRET_KEY)
    },
    note: missing.length
      ? `Official AP2 remains fail-closed until provider access and every required key/configuration gate is ready. Missing: ${missing.join(', ')}.`
      : 'Official AP2 mandate verification is enabled. Checkout and payment mandates are still subject to user authorization, merchant-signature, amount, currency, expiry, and replay checks.'
  };
}

export function officialAp2CapabilityEnabled() {
  return officialAp2Readiness().status === 'enabled';
}

function signingProfile(jwk, headerAlg) {
  const profile = SUPPORTED_ALGORITHMS.get(jwk?.crv);
  if (!profile || jwk?.kty !== 'EC' || (headerAlg && headerAlg !== profile.alg)) return null;
  return profile;
}

function publicKeyObject(jwk) {
  return crypto.createPublicKey({ key: jwk, format: 'jwk' });
}

function verifyCompactJws(token, jwk, label = 'mandate', { requireKeyId = true, allowKeyIdMismatch = false } = {}) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) throw new Error(`Malformed ${label} JWS`);
  const header = decodeJsonSegment(parts[0], `${label} header`);
  const payload = decodeJsonSegment(parts[1], `${label} payload`);
  const profile = signingProfile(jwk, header.alg);
  const headerKid = typeof header.kid === 'string' ? header.kid : '';
  if (!profile || header.alg !== profile.alg || (requireKeyId && !headerKid) || (!allowKeyIdMismatch && jwk.kid && headerKid && headerKid !== jwk.kid)) throw new Error(`Unsupported ${label} signing key`);
  const signature = b64urlDecode(parts[2], `${label} signature`);
  if (signature.length !== profile.signatureBytes) throw new Error(`Invalid ${label} signature length`);
  const valid = crypto.verify(profile.digest, Buffer.from(`${parts[0]}.${parts[1]}`, 'utf8'), {
    key: publicKeyObject(jwk),
    dsaEncoding: 'ieee-p1363'
  }, signature);
  if (!valid) throw new Error(`Invalid ${label} signature`);
  return { header, payload, parts };
}

function parseUnsignedJws(token, label) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) throw new Error(`Malformed ${label} JWS`);
  return {
    header: decodeJsonSegment(parts[0], `${label} header`),
    payload: decodeJsonSegment(parts[1], `${label} payload`),
    parts
  };
}

function parseSdJwt(token) {
  const raw = String(token || '');
  if (!raw || raw.length > MAX_TOKEN_LENGTH) throw new Error('Mandate exceeds the maximum supported size');
  const parts = raw.split('~');
  if (parts.length < 2 || !parts[0]) throw new Error('Mandate is not an SD-JWT');
  const issuerJwt = parts[0];
  const hasTrailingSeparator = raw.endsWith('~');
  const kbJwt = hasTrailingSeparator ? null : parts.at(-1);
  const disclosures = hasTrailingSeparator ? parts.slice(1, -1) : parts.slice(1, -1);
  if (disclosures.length > 256 || disclosures.some((disclosure) => !disclosure)) throw new Error('Mandate disclosures are invalid');
  const unsigned = parseUnsignedJws(issuerJwt, 'issuer mandate');
  return {
    raw,
    issuerJwt,
    disclosures,
    kbJwt,
    header: unsigned.header,
    unsignedPayload: unsigned.payload,
    sdJwt: `${issuerJwt}${disclosures.length ? `~${disclosures.join('~')}` : ''}~`
  };
}

function hashBytes(value, algorithm) {
  const digest = HASH_ALGORITHMS.get(algorithm || 'sha-256');
  if (!digest) throw new Error(`Unsupported SD-JWT hash algorithm: ${algorithm}`);
  return crypto.createHash(digest).update(String(value), 'ascii').digest('base64url');
}

function disclosureValue(disclosure) {
  const array = JSON.parse(b64urlDecode(disclosure, 'disclosure').toString('utf8'));
  if (!Array.isArray(array) || (array.length !== 2 && array.length !== 3) || typeof array[0] !== 'string' || !array[0]) throw new Error('Invalid SD-JWT disclosure');
  if (array.length === 3 && (typeof array[1] !== 'string' || !array[1])) throw new Error('Invalid SD-JWT property disclosure');
  return array;
}

function disclosureMap(parsed) {
  const algorithm = parsed.unsignedPayload._sd_alg || 'sha-256';
  if (!HASH_ALGORITHMS.has(algorithm)) throw new Error('Unsupported SD-JWT hash algorithm');
  const map = new Map();
  for (const disclosure of parsed.disclosures) {
    const digest = hashBytes(disclosure, algorithm);
    if (map.has(digest)) throw new Error('Duplicate SD-JWT disclosure');
    map.set(digest, disclosureValue(disclosure));
  }
  return { algorithm, map };
}

function resolvedDisclosure(digest, map) {
  const value = map.get(digest);
  if (!value) return undefined;
  return value.length === 3 ? value[2] : value[1];
}

function resolveNode(node, map) {
  if (typeof node === 'string' && map.has(node)) return resolveNode(resolvedDisclosure(node, map), map);
  if (Array.isArray(node)) return node.map((value) => resolveNode(value, map));
  if (!isRecord(node)) return node;
  if (typeof node['...'] === 'string' && map.has(node['...'])) return resolveNode(resolvedDisclosure(node['...'], map), map);

  const output = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === '_sd' && Array.isArray(value)) {
      for (const digest of value) {
        if (typeof digest !== 'string' || !map.has(digest)) continue;
        const disclosure = map.get(digest);
        if (disclosure.length === 3) output[disclosure[1]] = resolveNode(disclosure[2], map);
      }
      continue;
    }
    if (key === '...') continue;
    output[key] = resolveNode(value, map);
  }
  return output;
}

function effectiveItems(payload) {
  if (!Array.isArray(payload?.delegate_payload)) return [];
  return payload.delegate_payload.filter(isRecord);
}

function claimCandidates(payload) {
  return [payload, ...effectiveItems(payload)];
}

function findClaim(payload, predicate) {
  return claimCandidates(payload).find((candidate) => predicate(candidate)) || null;
}

function findClaims(final, predicate) {
  return (final?.chain || [final]).flatMap(({ payload }) => claimCandidates(payload)).filter((candidate) => predicate(candidate));
}

function findConfirmationKey(payload) {
  const candidates = [payload, ...effectiveItems(payload)];
  for (const candidate of candidates) {
    if (isRecord(candidate?.cnf?.jwk)) return validPublicJwk({ ...candidate.cnf.jwk, kid: candidate.cnf.jwk.kid || `cnf-${hashValue(JSON.stringify(candidate.cnf.jwk)).slice(0, 16)}` });
  }
  return null;
}

function mandateError(code, message, status = 409) {
  return commerceError(code, message, status, false);
}

function checkTimes(payload, nowSeconds) {
  const candidates = [payload, ...effectiveItems(payload)];
  for (const candidate of candidates) {
    if (candidate.exp !== undefined) {
      const exp = Number(candidate.exp);
      if (!Number.isInteger(exp) || exp <= nowSeconds) throw mandateError('AP2_MANDATE_EXPIRED', 'The AP2 mandate has expired.', 409);
    }
    if (candidate.iat !== undefined) {
      const iat = Number(candidate.iat);
      if (!Number.isInteger(iat) || iat > nowSeconds + CLOCK_SKEW_SECONDS) throw mandateError('AP2_MANDATE_INVALID_TIME', 'The AP2 mandate timestamp is invalid.', 409);
    }
  }
}

function verifyKeyBinding(parsed, payload, previous, expectedAud, expectedNonce) {
  const bindingNames = ['sd_hash', 'issuer_jwt_hash'].filter((name) => payload[name] !== undefined);
  if (bindingNames.length !== 1) throw mandateError('AP2_MANDATE_INVALID_SIGNATURE', 'The AP2 mandate key binding is incomplete.', 409);
  const expected = hashBytes(previous.sdJwt, previous.hashAlgorithm);
  if (payload[bindingNames[0]] !== expected) throw mandateError('AP2_MANDATE_INVALID_SIGNATURE', 'The AP2 mandate is not bound to the preceding mandate.', 409);
  if (parsed.header.typ !== 'kb+sd-jwt' && parsed.header.typ !== 'kb+sd-jwt+kb' && parsed.header.typ !== 'kb-sd-jwt' && parsed.header.typ !== 'kb-sd-jwt+kb') {
    throw mandateError('AP2_MANDATE_INVALID_SIGNATURE', 'The AP2 mandate key-binding type is not supported.', 409);
  }
  if (typeof payload.aud !== 'string' || !payload.aud || typeof payload.nonce !== 'string' || !payload.nonce) {
    throw mandateError('AP2_MANDATE_INVALID_SIGNATURE', 'The AP2 mandate is missing its audience or nonce.', 409);
  }
  if (expectedAud && payload.aud !== expectedAud) throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The AP2 mandate audience does not match this merchant.', 409);
  if (expectedNonce && payload.nonce !== expectedNonce) throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The AP2 mandate nonce does not match this checkout.', 409);
}

function verifyChain(token, { roots, expectedAud, expectedNonce, now = new Date() } = {}) {
  const rawSegments = String(token || '').split('~~');
  const segments = rawSegments.map((segment, index) => {
    let normalized = segment;
    // MandateClient-style chains remove the trailing SD-JWT separator before
    // adding `~~`; other implementations leave it in place. Accept both wire
    // spellings without changing the canonical token used for sd_hash.
    if (index > 0 && normalized.startsWith('~')) normalized = normalized.slice(1);
    if (index < rawSegments.length - 1 && !normalized.endsWith('~')) normalized += '~';
    return normalized;
  });
  if (!segments.length || segments.length > MAX_CHAIN_DEPTH) throw mandateError('AP2_MANDATE_INVALID_SIGNATURE', 'The AP2 mandate chain is invalid.', 409);
  const nowSeconds = Math.floor(now.getTime() / 1000);
  let previous = null;
  let final = null;
  const chain = [];
  for (const [index, segment] of segments.entries()) {
    const parsed = parseSdJwt(segment);
    const key = index === 0
      ? roots.find((candidate) => candidate.kid === parsed.header.kid)
      : findConfirmationKey(previous.payload);
    if (!key) {
      if (index === 0) throw mandateError('AP2_AGENT_MISSING_KEY', 'The AP2 agent signing key is not registered for this merchant.', 409);
      throw mandateError('AP2_MANDATE_INVALID_SIGNATURE', 'The AP2 mandate delegation key is missing.', 409);
    }

    let verified;
    try {
      verified = verifyCompactJws(parsed.issuerJwt, key, index === 0 ? 'root mandate' : 'delegated mandate', {
        requireKeyId: index === 0,
        allowKeyIdMismatch: index > 0
      });
    } catch {
      throw mandateError('AP2_MANDATE_INVALID_SIGNATURE', 'The AP2 mandate signature could not be verified.', 409);
    }
    const { algorithm, map } = disclosureMap(parsed);
    const payload = resolveNode(verified.payload, map);
    checkTimes(payload, nowSeconds);
    if (previous) verifyKeyBinding(parsed, payload, previous, expectedAud, expectedNonce);
    if (parsed.kbJwt) {
      throw mandateError('AP2_MANDATE_INVALID_SIGNATURE', 'This AP2 implementation accepts the AP2 KB-SD-JWT form only.', 409);
    }
    final = { ...parsed, header: verified.header, payload, hashAlgorithm: algorithm };
    chain.push(final);
    previous = final;
  }
  return { ...final, chain };
}

function checkoutTotal(checkout) {
  const total = Array.isArray(checkout?.totals) ? checkout.totals.find((item) => item?.type === 'total') : null;
  const amount = Number(total?.amount);
  if (!Number.isInteger(amount) || amount <= 0) throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The checkout total is not valid for AP2.', 409);
  return amount;
}

function decodeEmbeddedCheckout(value) {
  if (isRecord(value)) {
    if (isRecord(value.payload)) return value.payload;
    return value;
  }
  if (typeof value !== 'string' || !value.trim()) throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The checkout mandate does not contain a checkout object.', 409);
  const raw = value.trim();
  const parts = raw.split('.');
  if (parts.length === 3) {
    try { return decodeJsonSegment(parts[1], 'checkout'); } catch { throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The checkout mandate contains an invalid checkout JWT.', 409); }
  }
  try {
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) throw new Error('not an object');
    return isRecord(parsed.payload) ? parsed.payload : parsed;
  } catch {
    throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The checkout mandate contains an invalid checkout object.', 409);
  }
}

function checkoutScope(checkout) {
  return {
    id: checkout?.id,
    currency: checkout?.currency,
    line_items: checkout?.line_items,
    totals: checkout?.totals
  };
}

function sameScope(left, right) {
  return jcsCanonicalize(checkoutScope(left)) === jcsCanonicalize(checkoutScope(right));
}

function hostOf(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const candidate = value.includes('://') ? value : 'https://' + value;
    return new URL(candidate).hostname.toLowerCase().replace(/^www[.]/, '');
  } catch {
    return null;
  }
}

function merchantIdentityMatches(left, right) {
  if (!isRecord(left) || !isRecord(right)) return false;
  const leftHost = hostOf(left.website || left.domain_name);
  const rightHost = hostOf(right.website || right.domain_name);
  if (leftHost && rightHost) return leftHost === rightHost;
  if (left.id && right.id) return String(left.id) === String(right.id);
  return false;
}

function isThisMerchant(merchant) {
  const current = { id: String(process.env.AP2_MERCHANT_ID || '').trim(), website: siteOrigin() };
  return merchantIdentityMatches(merchant, current)
    || (current.id && String(merchant?.id || '') === current.id);
}

function constraintMismatch(message) {
  throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', message, 409);
}

function checkoutItemId(line) {
  return String(line?.item?.id || line?.product?.id || '').trim();
}

function checkoutLineQuantity(line) {
  const quantity = Number(line?.quantity);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : null;
}

function maxFlow(capacity, source, sink) {
  let flow = 0;
  while (true) {
    const parent = Array(capacity.length).fill(-1);
    parent[source] = source;
    const queue = [source];
    for (let index = 0; index < queue.length; index += 1) {
      const node = queue[index];
      for (let next = 0; next < capacity.length; next += 1) {
        if (parent[next] === -1 && capacity[node][next] > 0) {
          parent[next] = node;
          queue.push(next);
        }
      }
    }
    if (parent[sink] === -1) break;
    let amount = Number.POSITIVE_INFINITY;
    for (let node = sink; node !== source; node = parent[node]) amount = Math.min(amount, capacity[parent[node]][node]);
    for (let node = sink; node !== source; node = parent[node]) {
      capacity[parent[node]][node] -= amount;
      capacity[node][parent[node]] += amount;
    }
    flow += amount;
  }
  return flow;
}

function checkoutLineItemsConstraintMatches(constraint, checkout) {
  if (!Array.isArray(constraint?.items) || !constraint.items.length || !Array.isArray(checkout?.line_items)) return false;
  const requirements = constraint.items.map((requirement) => ({
    quantity: Number(requirement?.quantity),
    acceptable: new Set((Array.isArray(requirement?.acceptable_items) ? requirement.acceptable_items : []).map((item) => String(item?.id || '').trim()).filter(Boolean))
  }));
  const lines = checkout.line_items.map((line) => ({ id: checkoutItemId(line), quantity: checkoutLineQuantity(line) }));
  if (requirements.some(({ quantity, acceptable }) => !Number.isInteger(quantity) || quantity < 1 || !acceptable.size)
    || lines.some(({ id, quantity }) => !id || !quantity)) return false;
  const requested = requirements.reduce((total, item) => total + item.quantity, 0);
  const offered = lines.reduce((total, item) => total + item.quantity, 0);
  if (requested !== offered) return false;

  const source = 0;
  const requirementOffset = 1;
  const lineOffset = requirementOffset + requirements.length;
  const sink = lineOffset + lines.length;
  const capacity = Array.from({ length: sink + 1 }, () => Array(sink + 1).fill(0));
  requirements.forEach((requirement, requirementIndex) => {
    capacity[source][requirementOffset + requirementIndex] = requirement.quantity;
    lines.forEach((line, lineIndex) => {
      if (requirement.acceptable.has(line.id)) capacity[requirementOffset + requirementIndex][lineOffset + lineIndex] = line.quantity;
    });
  });
  lines.forEach((line, lineIndex) => { capacity[lineOffset + lineIndex][sink] = line.quantity; });
  return maxFlow(capacity, source, sink) === requested;
}

function evaluateCheckoutConstraints(final, checkout) {
  for (const open of findClaims(final, (candidate) => candidate.vct === 'mandate.checkout.open.1')) {
    if (open.constraints === undefined) continue;
    if (!Array.isArray(open.constraints)) constraintMismatch('The AP2 checkout constraints are invalid.');
    for (const constraint of open.constraints) {
      const type = String(constraint?.type || '');
      if (type === 'checkout.allowed_merchants') {
        if (!Array.isArray(constraint.allowed) || !constraint.allowed.some((merchant) => isThisMerchant(merchant))) {
          constraintMismatch('The AP2 checkout is not authorized for this merchant.');
        }
      } else if (type === 'checkout.line_items') {
        if (!checkoutLineItemsConstraintMatches(constraint, checkout)) {
          constraintMismatch('The AP2 checkout line items do not satisfy the user-approved constraints.');
        }
      } else {
        constraintMismatch('The AP2 checkout constraint "' + (type || 'unknown') + '" is not supported by this merchant.');
      }
    }
  }
}

function paymentInstrumentMatches(actual, allowed) {
  if (!isRecord(actual) || !isRecord(allowed)) return false;
  const fields = ['id', 'type'];
  const defined = fields.filter((field) => allowed[field] !== undefined);
  return defined.length > 0 && defined.every((field) => String(actual[field] || '').toLowerCase() === String(allowed[field] || '').toLowerCase());
}

function pispMatches(actual, allowed) {
  if (!isRecord(actual) || !isRecord(allowed)) return false;
  const actualHost = hostOf(actual.domain_name || actual.website);
  const allowedHost = hostOf(allowed.domain_name || allowed.website);
  if (actualHost && allowedHost) return actualHost === allowedHost;
  return Boolean(actual.id && allowed.id && String(actual.id) === String(allowed.id));
}

function evaluatePaymentConstraints(final, mandate, checkoutMandate, now) {
  const paymentAmount = Number(mandate.payment_amount?.amount);
  const paymentCurrency = String(mandate.payment_amount?.currency || '').toLowerCase();
  for (const open of findClaims(final, (candidate) => candidate.vct === 'mandate.payment.open.1')) {
    if (open.constraints === undefined) continue;
    if (!Array.isArray(open.constraints)) constraintMismatch('The AP2 payment constraints are invalid.');
    for (const constraint of open.constraints) {
      const type = String(constraint?.type || '');
      if (type === 'payment.amount_range') {
        const min = constraint.min === undefined ? 0 : Number(constraint.min);
        const max = Number(constraint.max);
        if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < min
          || String(constraint.currency || '').toLowerCase() !== paymentCurrency || paymentAmount < min || paymentAmount > max) {
          constraintMismatch('The AP2 payment amount is outside the user-approved range.');
        }
      } else if (type === 'payment.allowed_payees') {
        if (!isThisMerchant(mandate.payee) || !Array.isArray(constraint.allowed)
          || !constraint.allowed.some((payee) => merchantIdentityMatches(mandate.payee, payee))) {
          constraintMismatch('The AP2 payment payee is not authorized by the user-approved constraints.');
        }
      } else if (type === 'payment.allowed_payment_instruments') {
        if (!Array.isArray(constraint.allowed)
          || !constraint.allowed.some((instrument) => paymentInstrumentMatches(mandate.payment_instrument, instrument))) {
          constraintMismatch('The AP2 payment instrument is not authorized by the user-approved constraints.');
        }
      } else if (type === 'payment.allowed_pisps') {
        if (!mandate.pisp || !Array.isArray(constraint.allowed)
          || !constraint.allowed.some((pisp) => pispMatches(mandate.pisp, pisp))) {
          constraintMismatch('The AP2 payment initiation provider is not authorized by the user-approved constraints.');
        }
      } else if (type === 'payment.reference') {
        if (!checkoutMandate?.openMandateHash || constraint.conditional_transaction_id !== checkoutMandate.openMandateHash) {
          constraintMismatch('The AP2 payment mandate is not bound to the authorized checkout mandate.');
        }
      } else if (type === 'payment.execution_date') {
        const execution = mandate.execution_date ? Date.parse(mandate.execution_date) : now.getTime();
        const notBefore = constraint.not_before ? Date.parse(constraint.not_before) : Number.NEGATIVE_INFINITY;
        const notAfter = constraint.not_after ? Date.parse(constraint.not_after) : Number.POSITIVE_INFINITY;
        if (!Number.isFinite(execution) || (!Number.isFinite(notBefore) && notBefore !== Number.NEGATIVE_INFINITY)
          || (!Number.isFinite(notAfter) && notAfter !== Number.POSITIVE_INFINITY) || execution < notBefore || execution > notAfter) {
          constraintMismatch('The AP2 payment execution date is outside the user-approved window.');
        }
      } else {
        constraintMismatch('The AP2 payment constraint "' + (type || 'unknown') + '" is not supported by this merchant.');
      }
    }
  }
}

export function createMerchantAuthorization({ checkout, privateJwk = readPrivateJwk() } = {}) {
  if (!privateJwk || !isRecord(checkout)) return null;
  const profile = signingProfile(privateJwk);
  if (!profile) return null;
  try {
    const header = { alg: profile.alg, kid: privateJwk.kid };
    const encodedHeader = b64urlEncode(JSON.stringify(header));
    const encodedPayload = b64urlEncode(Buffer.from(jcsCanonicalize(withoutAp2(checkout)), 'utf8'));
    const signature = crypto.sign(profile.digest, Buffer.from(`${encodedHeader}.${encodedPayload}`, 'utf8'), {
      key: crypto.createPrivateKey({ key: privateJwk, format: 'jwk' }),
      dsaEncoding: 'ieee-p1363'
    });
    if (signature.length !== profile.signatureBytes) return null;
    return `${encodedHeader}..${signature.toString('base64url')}`;
  } catch {
    return null;
  }
}

export function verifyMerchantAuthorization({ checkout, authorization, publicJwks = readPublicJwks('UCP_SIGNING_PUBLIC_JWK') } = {}) {
  if (!isRecord(checkout) || typeof authorization !== 'string') return false;
  const parts = authorization.split('.');
  if (parts.length !== 3 || parts[1] !== '') return false;
  let header;
  try { header = decodeJsonSegment(parts[0], 'merchant authorization header'); } catch { return false; }
  const key = publicJwks.find((candidate) => candidate.kid === header.kid);
  const profile = signingProfile(key, header.alg);
  if (!key || !profile || header.alg !== profile.alg) return false;
  let signature;
  try { signature = b64urlDecode(parts[2], 'merchant authorization signature'); } catch { return false; }
  if (signature.length !== profile.signatureBytes) return false;
  try {
    const encodedPayload = b64urlEncode(Buffer.from(jcsCanonicalize(withoutAp2(checkout)), 'utf8'));
    return crypto.verify(profile.digest, Buffer.from(`${parts[0]}.${encodedPayload}`, 'utf8'), {
      key: publicKeyObject(key),
      dsaEncoding: 'ieee-p1363'
    }, signature);
  } catch {
    return false;
  }
}

function signCompactJwt(payload, privateJwk) {
  const profile = signingProfile(privateJwk);
  if (!profile) return null;
  try {
    const header = { alg: profile.alg, typ: 'JWT', kid: privateJwk.kid };
    const encodedHeader = b64urlEncode(JSON.stringify(header));
    const encodedPayload = b64urlEncode(JSON.stringify(payload));
    const signature = crypto.sign(profile.digest, Buffer.from(encodedHeader + '.' + encodedPayload, 'utf8'), {
      key: crypto.createPrivateKey({ key: privateJwk, format: 'jwk' }),
      dsaEncoding: 'ieee-p1363'
    });
    if (signature.length !== profile.signatureBytes) return null;
    return encodedHeader + '.' + encodedPayload + '.' + signature.toString('base64url');
  } catch {
    return null;
  }
}

function createAp2Receipt({ kind, token, status = 'Success', orderId, paymentId, pspConfirmationId, error, errorDescription, now = new Date() } = {}) {
  if (!officialAp2CapabilityEnabled()) throw commerceError('AP2_PROVIDER_ACCESS_REQUIRED', 'Official AP2 receipts are not enabled for this merchant yet.', 503, true);
  if (status !== 'Success' && status !== 'Error') throw commerceError('AP2_RECEIPT_INVALID', 'The AP2 receipt status is invalid.', 500, false);
  const roots = kind === 'checkout' ? agentKeys() : paymentKeys();
  const final = verifyChain(token, {
    roots,
    expectedAud: String(process.env.AP2_EXPECTED_AUDIENCE || '').trim(),
    expectedNonce: String(process.env.AP2_EXPECTED_NONCE || '').trim(),
    now
  });
  const payload = {
    iss: siteOrigin(),
    iat: Math.floor(now.getTime() / 1000),
    status,
    reference: hashBytes(final.sdJwt, final.hashAlgorithm)
  };
  if (status === 'Success') {
    if (kind === 'checkout' && !orderId) throw commerceError('AP2_RECEIPT_INVALID', 'A successful checkout receipt requires an order ID.', 500, false);
    if (kind === 'payment' && !paymentId) throw commerceError('AP2_RECEIPT_INVALID', 'A successful payment receipt requires a payment ID.', 500, false);
    if (kind === 'checkout') payload.order_id = String(orderId).slice(0, 160);
    if (kind === 'payment') {
      payload.payment_id = String(paymentId).slice(0, 160);
      if (pspConfirmationId) payload.psp_confirmation_id = String(pspConfirmationId).slice(0, 160);
    }
  } else {
    payload.error = String(error || 'ap2_verification_failed').slice(0, 120);
    payload.error_description = String(errorDescription || 'The AP2 mandate could not be accepted.').slice(0, 500);
  }
  const privateJwk = kind === 'checkout' ? readPrivateJwk() : paymentReceiptSigningKey();
  const receipt = signCompactJwt(payload, privateJwk);
  if (!receipt) throw commerceError('AP2_RECEIPT_NOT_READY', 'The AP2 receipt signing key is not ready.', 503, true);
  return receipt;
}

export function createOfficialAp2CheckoutReceipt(options = {}) {
  return createAp2Receipt({ ...options, kind: 'checkout' });
}

export function createOfficialAp2PaymentReceipt(options = {}) {
  return createAp2Receipt({ ...options, kind: 'payment' });
}

export function verifyOfficialAp2CheckoutMandate({ token, checkout, expectedAud = String(process.env.AP2_EXPECTED_AUDIENCE || '').trim(), expectedNonce = String(process.env.AP2_EXPECTED_NONCE || '').trim(), now = new Date() } = {}) {
  if (!officialAp2CapabilityEnabled()) throw commerceError('AP2_PROVIDER_ACCESS_REQUIRED', 'Official AP2 mandate payments are not enabled for this merchant yet.', 503, true);
  const final = verifyChain(token, { roots: agentKeys(), expectedAud, expectedNonce, now });
  const mandate = findClaim(final.payload, (candidate) => candidate.vct === 'mandate.checkout.1');
  if (!mandate || typeof mandate.checkout_hash !== 'string' || mandate.checkout_jwt === undefined) throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The AP2 checkout mandate does not contain the required checkout proof.', 409);

  const rawCheckout = typeof mandate.checkout_jwt === 'string'
    ? mandate.checkout_jwt
    : jcsCanonicalize(mandate.checkout_jwt);
  const expectedHash = hashBytes(rawCheckout, final.hashAlgorithm);
  if (mandate.checkout_hash !== expectedHash) throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The AP2 checkout mandate hash does not match its checkout proof.', 409);
  const embeddedCheckout = decodeEmbeddedCheckout(mandate.checkout_jwt);
  const authorization = embeddedCheckout?.ap2?.merchant_authorization;
  if (typeof authorization !== 'string') throw mandateError('AP2_MERCHANT_AUTHORIZATION_MISSING', 'The AP2 checkout proof is missing the merchant authorization signature.', 409);
  if (!verifyMerchantAuthorization({ checkout: embeddedCheckout, authorization })) throw mandateError('AP2_MERCHANT_AUTHORIZATION_INVALID', 'The AP2 merchant authorization signature could not be verified.', 409);
  if (!sameScope(embeddedCheckout, checkout)) throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The AP2 checkout mandate is bound to different checkout terms.', 409);
  evaluateCheckoutConstraints(final, embeddedCheckout);

  const expiresAt = [...[final.payload, ...effectiveItems(final.payload)], ...[embeddedCheckout]].map((value) => Number(value?.exp)).find((value) => Number.isInteger(value) && value > 0);
  const openCheckoutSegment = final.chain?.find((segment) => findClaim(segment.payload, (candidate) => candidate.vct === 'mandate.checkout.open.1'));
  return {
    official: true,
    mandateId: `ap2_${hashValue(token).slice(0, 48)}`,
    agentKeyId: String(final.header.kid || final.chain?.[0]?.header?.kid || '').slice(0, 200),
    cartHash: hashValue(JSON.stringify(checkout?.line_items || [])),
    currency: String(checkout?.currency || '').toLowerCase(),
    amountMax: checkoutTotal(checkout),
    expiresAt: expiresAt ? new Date(expiresAt * 1000).toISOString() : checkout?.expires_at,
    signature: token,
    checkoutHash: mandate.checkout_hash,
    checkoutMandateToken: token,
    mandateReference: hashBytes(final.sdJwt, final.hashAlgorithm),
    ...(openCheckoutSegment ? { openMandateHash: hashBytes(openCheckoutSegment.sdJwt, openCheckoutSegment.hashAlgorithm) } : {})
  };
}

export function extractOfficialPaymentMandate(payment = {}) {
  const candidates = [
    payment?.ap2?.payment_mandate,
    payment?.payment_mandate,
    ...(Array.isArray(payment?.instruments) ? payment.instruments.map((instrument) => instrument?.credential?.payment_mandate || instrument?.credential?.token) : [])
  ];
  return candidates.find((candidate) => typeof candidate === 'string' && candidate && !/^spt_[A-Za-z0-9]+$/.test(candidate)) || null;
}

export function verifyOfficialAp2PaymentMandate({ token, checkout, checkoutMandate, now = new Date() } = {}) {
  if (!officialAp2CapabilityEnabled()) throw commerceError('AP2_PROVIDER_ACCESS_REQUIRED', 'Official AP2 payment mandates are not enabled for this merchant yet.', 503, true);
  const roots = paymentKeys();
  const final = verifyChain(token, { roots, expectedAud: String(process.env.AP2_EXPECTED_AUDIENCE || '').trim(), expectedNonce: String(process.env.AP2_EXPECTED_NONCE || '').trim(), now });
  const mandate = findClaim(final.payload, (candidate) => candidate.vct === 'mandate.payment.1');
  if (!mandate || !isRecord(mandate.payment_amount) || !isRecord(mandate.payee)
    || !isRecord(mandate.payment_instrument) || typeof mandate.transaction_id !== 'string' || !mandate.transaction_id) {
    throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The AP2 payment mandate does not contain the required payment proof.', 409);
  }
  if (checkoutMandate?.checkoutHash && mandate.transaction_id !== checkoutMandate.checkoutHash) throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The AP2 payment mandate is bound to a different checkout.', 409);
  const paymentAmount = Number(mandate.payment_amount.amount);
  const paymentCurrency = String(mandate.payment_amount.currency || '').toLowerCase();
  if (!Number.isInteger(paymentAmount) || paymentAmount <= 0 || paymentAmount !== checkoutTotal(checkout)
    || paymentCurrency !== String(checkout.currency || '').toLowerCase()) {
    throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The AP2 payment amount does not match this checkout.', 409);
  }
  const payeeUrl = mandate.payee.website || mandate.payee.domain_name;
  if (typeof payeeUrl !== 'string') throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The AP2 payment mandate does not identify a merchant payee.', 409);
  try {
    const expectedHost = new URL(siteOrigin()).hostname.replace(/^www\./, '');
    const actualHost = new URL(payeeUrl).hostname.replace(/^www\./, '');
    if (expectedHost !== actualHost) throw new Error('payee mismatch');
  } catch {
    throw mandateError('AP2_MANDATE_SCOPE_MISMATCH', 'The AP2 payment payee does not match this merchant.', 409);
  }
  evaluatePaymentConstraints(final, mandate, checkoutMandate, now);
  return {
    official: true,
    paymentMandateId: `payment_${hashValue(token).slice(0, 48)}`,
    agentKeyId: String(final.header.kid || final.chain?.[0]?.header?.kid || '').slice(0, 200),
    mandateHash: hashValue(token),
    paymentMandateToken: token,
    mandateReference: hashBytes(final.sdJwt, final.hashAlgorithm)
  };
}
