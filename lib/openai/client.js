import OpenAI from 'openai';

let cachedClient = null;

export function createPortalClient(options = {}) {
  if (options.forceNew || !cachedClient) {
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    cachedClient = new OpenAI({ apiKey });
  }
  return cachedClient;
}


