const DEFAULT_ALLOWED_HEADERS = 'Content-Type, X-User-Id';
const DEFAULT_ALLOWED_METHODS = 'GET, POST, OPTIONS';
const DEFAULT_EXPOSED_HEADERS = 'Accept-Ranges, Content-Disposition, Content-Length, Content-Range';

function escapeRegExp(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function normalizeOrigin(value) {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '');
}

function compileOriginMatcher(pattern) {
  const normalized = normalizeOrigin(pattern);
  if (!normalized) {
    return null;
  }

  if (normalized === '*') {
    return () => true;
  }

  if (!normalized.includes('*')) {
    return (origin) => normalizeOrigin(origin) === normalized;
  }

  const regex = new RegExp(`^${escapeRegExp(normalized).replace(/\\\*/g, '.*')}$`);
  return (origin) => regex.test(normalizeOrigin(origin));
}

const configuredOriginMatchers = String(process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => compileOriginMatcher(value))
  .filter(Boolean);

const localOriginMatchers = [
  /^http:\/\/localhost(?::\d+)?$/i,
  /^http:\/\/127\.0\.0\.1(?::\d+)?$/i
];

function isLocalOrigin(origin) {
  return localOriginMatchers.some((matcher) => matcher.test(normalizeOrigin(origin)));
}

export function resolveAllowedOrigin(origin) {
  if (!origin) {
    return null;
  }

  if (isLocalOrigin(origin)) {
    return origin;
  }

  for (const matcher of configuredOriginMatchers) {
    if (matcher(origin)) {
      return origin;
    }
  }

  return null;
}

export function applyCors(request, response) {
  const origin = request.headers.get('origin');
  const allowedOrigin = resolveAllowedOrigin(origin);

  response.headers.set('Access-Control-Allow-Headers', DEFAULT_ALLOWED_HEADERS);
  response.headers.set('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
  response.headers.set('Access-Control-Expose-Headers', DEFAULT_EXPOSED_HEADERS);
  response.headers.set('Access-Control-Max-Age', '86400');
  response.headers.append('Vary', 'Origin');

  if (allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  }

  return response;
}
