import { z } from 'zod';

export const ACCOUNT_CAPABILITY_ID = 'cognistration-account-options';
export const ACCOUNT_CAPABILITY_VERSION = '0.1.0';
export const ACCOUNT_SIGNUP_CAPABILITY_ID = 'cognistration-account-signup';
export const ACCOUNT_SIGNUP_CAPABILITY_VERSION = '0.1.0';

export const AccountOptionsInputSchema = z.object({}).strict();
export const AccountSignupInputSchema = z.object({}).strict();

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
      preferredFlow: 'in_platform_widget',
      widgetAvailable: true,
      userSubmissionRequired: true,
      credentialsAcceptedByPublicMcp: false,
      paymentSubmittedByPublicMcp: false
    },
    note: 'The public MCP can open an in-platform signup form, but credentials are submitted directly by the user to Cognistration. Free previews and the paid private workspace are separate paths; checkout remains a separate user-reviewed step.'
  };
}

export function accountSignupState() {
  return {
    capabilityId: ACCOUNT_SIGNUP_CAPABILITY_ID,
    version: ACCOUNT_SIGNUP_CAPABILITY_VERSION,
    status: 'ready',
    userSubmissionRequired: true,
    credentialsSubmitted: false,
    paymentSubmitted: false,
    availableActions: ['enter_credentials', 'verify_email', 'sign_in_and_review_checkout'],
    message: 'The in-platform account form is ready. The user enters and submits credentials directly; payment is a separate reviewed step.'
  };
}
