'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  pushCognistrationEvent,
  getSafeCognistrationRoute,
  readCognistrationAnalyticsConsent,
  startCognistrationGtm,
  updateCognistrationAnalyticsConsent,
} from '@/lib/analytics/client.mjs';

const SAFE_TOKEN = /^[a-z][a-z0-9_-]{0,63}$/;
const CTA_DESTINATIONS = new Map([
  ['/pricing', 'navigate_pricing'],
  ['/signup', 'navigate_signup'],
  ['/packs', 'navigate_packs'],
  ['/try', 'navigate_try'],
  ['/machine', 'navigate_machine'],
  ['/contact', 'navigate_contact'],
]);

function getCtaContext(target, pathname) {
  const explicitId = target?.getAttribute('data-analytics-cta') || '';
  const explicitPlacement = target?.getAttribute('data-analytics-placement') || '';
  if (SAFE_TOKEN.test(explicitId) && SAFE_TOKEN.test(explicitPlacement)) {
    return { cta_id: explicitId, page_placement: explicitPlacement };
  }

  let ctaId = '';
  const href = target?.getAttribute('href');
  if (href) {
    try {
      const destination = new URL(href, window.location.origin);
      if (destination.origin === window.location.origin) {
        ctaId = CTA_DESTINATIONS.get(destination.pathname) || '';
      } else if (destination.hostname === 'apps.apple.com' && destination.pathname.includes('/app/cognistration/id6780132617')) {
        ctaId = 'app_store';
      }
    } catch {
      return null;
    }
  }

  if (!ctaId) return null;
  const page = pathname?.startsWith('/blog/')
    ? 'blog_article'
    : pathname?.startsWith('/tutorial/')
      ? 'tutorial_article'
      : pathname === '/'
        ? 'home'
        : safePageSection(pathname);
  return page && SAFE_TOKEN.test(page) ? { cta_id: ctaId, page_placement: page } : null;
}

function safePageSection(pathname) {
  const pagePath = getSafeCognistrationRoute(pathname);
  if (!pagePath) return null;
  if (pagePath.startsWith('/blog/')) return 'blog_article';
  if (pagePath.startsWith('/tutorial/')) return 'tutorial_article';
  if (pagePath.startsWith('/community/')) return 'community_profile';
  if (pagePath.startsWith('/checkout/')) return 'checkout';
  return pagePath.slice(1).split('/')[0] || 'home';
}

export function CognistrationAnalytics() {
  const pathname = usePathname();
  const startedPathRef = useRef(null);

  useEffect(() => {
    const sendPageView = () => {
      if (!readCognistrationAnalyticsConsent()) return;
      if (!startCognistrationGtm()) return;
      if (startedPathRef.current === pathname) return;

      startedPathRef.current = pathname;
      pushCognistrationEvent('page_view');
    };

    const onConsentChange = (event) => {
      const consent = event?.detail?.analytics;
      try {
        window.localStorage.setItem('cognistration:analytics-consent', consent === true ? 'granted' : 'denied');
      } catch {
        return;
      }
      if (consent === true) sendPageView();
      else {
        startedPathRef.current = null;
        updateCognistrationAnalyticsConsent(false);
      }
    };

    const onClick = (event) => {
      if (!readCognistrationAnalyticsConsent()) return;
      const target = event.target instanceof Element
        ? event.target.closest('[data-analytics-cta], a[href]')
        : null;
      const context = getCtaContext(target, pathname);
      if (!context) return;
      pushCognistrationEvent('cta_click', context);
    };

    const startedForms = new WeakSet();
    const onFormStart = (event) => {
      if (!readCognistrationAnalyticsConsent()) return;
      const form = event.target instanceof Element ? event.target.closest('form[data-analytics-form]') : null;
      const formId = form?.getAttribute('data-analytics-form') || '';
      if (!form || !SAFE_TOKEN.test(formId) || startedForms.has(form)) return;
      startedForms.add(form);
      pushCognistrationEvent('form_start', { form_id: formId });
    };

    sendPageView();
    document.addEventListener('click', onClick, true);
    document.addEventListener('focusin', onFormStart, true);
    window.addEventListener('cognistration:analytics-consent', onConsentChange);

    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('focusin', onFormStart, true);
      window.removeEventListener('cognistration:analytics-consent', onConsentChange);
    };
  }, [pathname]);

  return null;
}
