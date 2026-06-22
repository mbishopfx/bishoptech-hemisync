import OpenAI from 'openai';

let cachedClient = null;

function getGatewayBaseURL() {
  return process.env.AI_GATEWAY_URL || 'https://ai-gateway.vercel.sh/v1';
}

function getGatewayApiKey(options = {}) {
  return (
    options.apiKey ||
    process.env.AI_GATEWAY_API_KEY ||
    process.env.VERCEL_OIDC_TOKEN ||
    process.env.VERCEL ||
    process.env.VERCEL_AI_GATEWAY_KEY ||
    process.env.OPENAI_API_KEY
  );
}

export function createPortalClient(options = {}) {
  if (options.forceNew || !cachedClient) {
    const apiKey = getGatewayApiKey(options);
    if (!apiKey) {
      throw new Error('AI_GATEWAY_API_KEY is not configured');
    }

    cachedClient = new OpenAI({
      apiKey,
      baseURL: getGatewayBaseURL(),
    });
  }

  return cachedClient;
}
