const buckets = new Map();
const WINDOW_MS = 60 * 1000;

function clientKey(request, scope) {
  const forwarded = request?.headers?.get('x-forwarded-for') || '';
  const address = forwarded.split(',')[0].trim() || request?.headers?.get('x-real-ip') || 'anonymous';
  return `${scope}:${address}`;
}

export function commerceRateLimited(request, { scope = 'commerce', limit = 30 } = {}) {
  const now = Date.now();
  const key = clientKey(request, scope);
  const current = buckets.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    buckets.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > limit;
}
