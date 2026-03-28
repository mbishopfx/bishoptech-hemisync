function normalizeOrigin(value) {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '');
}

const backendOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_BACKEND_ORIGIN);

function normalizePath(value) {
  if (!value) {
    return '/';
  }

  return value.startsWith('/') ? value : `/${value}`;
}

export function toBackendUrl(pathname) {
  const safePath = normalizePath(pathname);
  return backendOrigin ? `${backendOrigin}${safePath}` : safePath;
}

export function resolveBackendAssetUrl(url) {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return toBackendUrl(url);
}
