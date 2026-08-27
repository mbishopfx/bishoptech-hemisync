import { z } from 'zod';

export const POLICY_CAPABILITY_ID = 'cognistration-policy-information';
export const POLICY_CAPABILITY_VERSION = '0.1.0';
export const POLICY_TOPICS = ['safety', 'terms', 'privacy', 'cookies', 'ai', 'pricing', 'account'];

export const PolicyInputSchema = z
  .object({ topic: z.enum(POLICY_TOPICS) })
  .strict();

const POLICY_RECORDS = {
  safety: {
    title: 'Health and Safety Warning',
    path: '/health-warning',
    effectiveDate: '2026-08-27',
    summary: 'Cognistration audio is for entertainment and general wellness exploration only. Use moderate volume, never listen during hazardous activity, and stop immediately if you experience an adverse reaction. Higher-risk conditions require physician guidance.'
  },
  terms: {
    title: 'Terms and Conditions',
    path: '/terms',
    effectiveDate: '2026-08-27',
    summary: 'The terms govern use of Cognistration, including its general-wellness audio, account, content, availability, acceptable-use, payment, and liability boundaries.'
  },
  privacy: {
    title: 'Privacy Policy',
    path: '/privacy',
    effectiveDate: '2026-08-27',
    summary: 'The privacy policy explains account, prompt, session, device, cookie, analytics, authentication, storage, AI-processing, and payment-provider data handling.'
  },
  cookies: {
    title: 'Cookie Policy',
    path: '/cookies',
    effectiveDate: '2026-08-27',
    summary: 'Cookies and local storage support sign-in, playback state, preferences, product measurement, and public preview-limit enforcement. They are not used for ad targeting on this site.'
  },
  ai: {
    title: 'AI Disclosure',
    path: '/ai-disclosure',
    effectiveDate: '2026-08-27',
    summary: 'AI may help with tone ideas, matching, moderation, safety workflows, and operations. AI output is not medical advice, treatment, crisis support, or a guarantee of any result.'
  },
  pricing: {
    title: 'Cognistration Pricing',
    path: '/pricing',
    effectiveDate: null,
    summary: 'The private Cognistration workspace is currently offered for a one-time $20 payment. Public intention previews are available without an account, and tone packs are separate one-time purchases.'
  },
  account: {
    title: 'Create a Cognistration Account',
    path: '/signup',
    effectiveDate: null,
    summary: 'Account creation is a user-controlled form flow. The user reviews and submits username, email, password, verification, and any checkout step; public MCP tools do not receive or submit credentials.'
  }
};

function normalizeOrigin(origin) {
  return String(origin || 'https://cognistration.com').trim().replace(/\/+$/, '');
}

export function getPolicyInfo(input, origin = 'https://cognistration.com') {
  const parsed = PolicyInputSchema.parse(input);
  const record = POLICY_RECORDS[parsed.topic];
  return {
    capabilityId: POLICY_CAPABILITY_ID,
    version: POLICY_CAPABILITY_VERSION,
    topic: parsed.topic,
    title: record.title,
    url: `${normalizeOrigin(origin)}${record.path}`,
    effectiveDate: record.effectiveDate,
    summary: record.summary,
    source: 'Cognistration canonical policy page'
  };
}

export function policyCatalogSummary(origin = 'https://cognistration.com') {
  return {
    capabilityId: POLICY_CAPABILITY_ID,
    version: POLICY_CAPABILITY_VERSION,
    topics: POLICY_TOPICS.map((topic) => ({ topic, ...getPolicyInfo({ topic }, origin) }))
  };
}
