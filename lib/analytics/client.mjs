const CONSENT_KEY = 'cognistration:analytics-consent';
const SAFE_ANALYTICS_TOKEN = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const ANALYTICS_EVENTS = new Set(['page_view', 'cta_click', 'form_start', 'purchase']);
const PUBLIC_STATIC_PATHS = new Set([
  '/',
  '/about',
  '/services',
  '/pricing',
  '/packs',
  '/machine',
  '/try',
  '/tutorial',
  '/blog',
  '/community',
  '/docs',
  '/privacy',
  '/terms',
  '/cookies',
  '/contact',
  '/health-warning',
  '/ai-disclosure',
  '/signup',
  '/login',
  '/packs/success',
  '/checkout/confirmed',
  '/agent-instructions.md',
  '/agent-mode',
  '/ask',
  '/auth.md',
  '/docs.md',
  '/index.md',
  '/llms.txt',
  '/pricing.md',
]);

export function getSafeCognistrationRoute(pathname) {
  const path = pathname || '/';
  if (PUBLIC_STATIC_PATHS.has(path)) return path;
  if (/^\/blog\/[a-z0-9-]+$/.test(path)) return path;
  if (/^\/tutorial\/[a-z0-9-]+$/.test(path)) return path;
  if (/^\/community\/[^/]+$/.test(path)) return '/community/:profile';
  if (/^\/checkout\/ucp\/[^/]+$/.test(path)) return '/checkout/ucp/:checkout';
  return null;
}

function safePageContext(pathname) {
  const pagePath = getSafeCognistrationRoute(pathname);
  if (!pagePath || typeof window === 'undefined') return null;

  const section = pagePath.startsWith('/blog/')
    ? 'blog_article'
    : pagePath.startsWith('/tutorial/')
      ? 'tutorial_article'
      : pagePath === '/'
        ? 'home'
        : pagePath.slice(1).split('/')[0] || 'home';

  return {
    page_path: pagePath,
    page_title: `Cognistration | ${section}`,
    page_location: `${window.location.origin}${pagePath}`,
  };
}

function hasAnalyticsConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

function sanitizeEventParameters(event, parameters) {
  if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) return null;

  if (event === 'page_view') return {};

  if (event === 'cta_click') {
    const { cta_id, page_placement } = parameters;
    if (!SAFE_ANALYTICS_TOKEN.test(cta_id || '') || !SAFE_ANALYTICS_TOKEN.test(page_placement || '')) return null;
    return { cta_id, page_placement };
  }

  if (event === 'form_start') {
    const { form_id } = parameters;
    return SAFE_ANALYTICS_TOKEN.test(form_id || '') ? { form_id } : null;
  }

  if (event === 'purchase') {
    const { currency, items } = parameters;
    if (currency !== 'USD' || !Array.isArray(items) || items.length < 1 || items.length > 5) return null;
    const safeItems = items.map((item) => {
      const itemId = item && typeof item === 'object' ? item.item_id : null;
      return SAFE_ANALYTICS_TOKEN.test(itemId || '') ? { item_id: itemId } : null;
    });
    return safeItems.every(Boolean) ? { currency, items: safeItems } : null;
  }

  return null;
}

export function pushCognistrationEvent(event, parameters = {}, options = {}) {
  if (typeof window === 'undefined' || !ANALYTICS_EVENTS.has(event) || !hasAnalyticsConsent() || !window.dataLayer) return false;

  const page = safePageContext(options.pagePath || window.location.pathname);
  if (!page) return false;

  const safeParameters = sanitizeEventParameters(event, parameters);
  if (!safeParameters) return false;

  window.dataLayer.push({ ...page, ...safeParameters, event });
  return true;
}

export function startCognistrationGtm() {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return false;
  if (window.__cognistrationGtmLoaded) return true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(Array.from(arguments)); };
  window.gtag('consent', 'default', { analytics_storage: 'denied' });
  window.__cognistrationGtmLoaded = true;
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  window.gtag('consent', 'update', { analytics_storage: 'granted' });

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-KXQH68LN';
  script.dataset.cognistrationGtm = 'true';
  document.head.appendChild(script);
  return true;
}

export function updateCognistrationAnalyticsConsent(consent) {
  if (typeof window === 'undefined' || !window.__cognistrationGtmLoaded || typeof window.gtag !== 'function') return false;
  window.gtag('consent', 'update', { analytics_storage: consent === true ? 'granted' : 'denied' });
  return true;
}

export function readCognistrationAnalyticsConsent() {
  return hasAnalyticsConsent();
}
