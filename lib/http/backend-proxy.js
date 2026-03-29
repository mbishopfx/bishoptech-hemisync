import { NextResponse } from 'next/server';

function normalizeOrigin(value) {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '');
}

function getBackendOrigin() {
  return normalizeOrigin(process.env.BACKEND_ORIGIN || process.env.NEXT_PUBLIC_BACKEND_ORIGIN);
}

function buildProxyHeaders(request) {
  const headers = new Headers(request.headers);

  headers.delete('host');
  headers.delete('origin');
  headers.delete('content-length');
  headers.delete('x-forwarded-host');
  headers.delete('x-forwarded-port');
  headers.delete('x-forwarded-proto');
  headers.delete('x-forwarded-for');

  return headers;
}

export async function maybeProxyToBackend(request, pathname = request.nextUrl.pathname) {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return null;
  }

  const target = new URL(`${backendOrigin}${pathname}`);
  target.search = request.nextUrl.search;

  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text();
  const upstream = await fetch(target, {
    method,
    headers: buildProxyHeaders(request),
    body,
    cache: 'no-store',
    redirect: 'manual'
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: upstream.headers
  });
}
