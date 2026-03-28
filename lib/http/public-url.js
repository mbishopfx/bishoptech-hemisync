function normalizePath(value) {
  if (!value) {
    return '/';
  }

  return value.startsWith('/') ? value : `/${value}`;
}

export function resolvePublicUrl(request, pathname) {
  const safePath = normalizePath(pathname);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost || request.headers.get('host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto || (request.nextUrl?.protocol ? request.nextUrl.protocol.replace(/:$/, '') : 'https');

  if (host) {
    return `${protocol}://${host}${safePath}`;
  }

  return new URL(safePath, request.url).toString();
}
