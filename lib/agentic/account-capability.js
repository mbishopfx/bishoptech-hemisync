import { z } from 'zod';

export const ACCOUNT_CAPABILITY_ID = 'cognistration-account-options';
export const ACCOUNT_CAPABILITY_VERSION = '0.1.0';

export const AccountOptionsInputSchema = z.object({}).strict();

function normalizeOrigin(origin) {
  return String(origin || 'https://cognistration.com').trim().replace(/\/+$/, '');
}

export function publicAccountOptions(origin = 'https://cognistration.com') {
  const canonicalOrigin = normalizeOrigin(origin);

  return {
    capabilityId: ACCOUNT_CAPABILITY_ID,
    version: ACCOUNT_CAPABILITY_VERSION,
    publicPreview: {
      name: 'Public intention preview',
      price: 'Free',
      previewGenerations: 3,
      access: 'anonymous',
      url: `${canonicalOrigin}/`,
      description: 'Try a short intention match and preview an approved public tone without creating an account.'
    },
    privateWorkspace: {
      name: 'Private Cognistration workspace',
      price: '$20 one time',
      billingMode: 'one-time payment',
      access: 'account plus checkout',
      url: `${canonicalOrigin}/signup`,
      description: 'Create an account, verify the email, and complete the user-reviewed checkout to unlock the private workspace.'
    },
    signup: {
      url: `${canonicalOrigin}/signup`,
      userSubmissionRequired: true,
      credentialsAcceptedByPublicMcp: false,
      paymentSubmittedByPublicMcp: false
    },
    note: 'There is no public MCP action that creates a free-trial account or submits credentials. Free previews and the paid private workspace are separate paths.'
  };
}
