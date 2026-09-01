import { jsonDiscoveryHeaders } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-dynamic';

function configuredKeys() {
  const raw = String(process.env.COGNISTRATION_AGENT_PUBLIC_JWK || '').trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    const keys = Array.isArray(parsed) ? parsed : [parsed];
    return keys.filter((key) => key && key.kty === 'OKP' && key.crv === 'Ed25519' && typeof key.n === 'string' && typeof key.kid === 'string')
      .map((key) => ({ ...key, nbf: key.nbf || Math.floor(Date.now() / 1000), ...(key.exp ? { exp: key.exp } : {}) }));
  } catch {
    return [];
  }
}

export function GET() {
  const keys = configuredKeys();
  return new Response(JSON.stringify({
    version: '1',
    algorithm: 'Ed25519',
    keys,
    status: keys.length ? 'configured' : 'not_configured',
    documentation: 'https://cognistration.com/auth.md#use-the-access_token'
  }), { headers: jsonDiscoveryHeaders({ cacheControl: 'public, max-age=60, s-maxage=60' }) });
}
