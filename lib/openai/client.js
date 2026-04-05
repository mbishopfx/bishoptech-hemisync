import OpenAI from 'openai';

let cachedClient = null;

function normalizeModel(model = '') {
  return String(model || '').toLowerCase();
}

function shouldUseGemini(options = {}) {
  const provider = (options.provider || process.env.AI_PROVIDER || '').toLowerCase();
  if (provider === 'gemini') return true;
  if (provider === 'openai') return false;
  return Boolean(process.env.GEMINI_API_KEY) && !process.env.OPENAI_API_KEY;
}

async function geminiGenerate({ model, messages, temperature = 0.2 }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const modelName = normalizeModel(model).replace(/^gemini\//, '') || 'gemini-1.5-pro';
  const systemParts = [];
  const contents = [];

  for (const message of messages || []) {
    if (!message || !message.role) continue;
    if (message.role === 'system') {
      if (message.content) systemParts.push(String(message.content));
      continue;
    }

    const role = message.role === 'assistant' ? 'model' : 'user';
    contents.push({
      role,
      parts: [{ text: String(message.content || '') }]
    });
  }

  const payload = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: 4096
    }
  };

  if (systemParts.length > 0) {
    payload.systemInstruction = {
      parts: [{ text: systemParts.join('\n\n') }]
    };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '';

  return {
    output_text: text,
    raw: data
  };
}

export function createPortalClient(options = {}) {
  if (shouldUseGemini(options)) {
    return {
      responses: {
        create: async ({ model, input, temperature = 0.2 }) => {
          const messages = Array.isArray(input) ? input : [];
          return geminiGenerate({ model, messages, temperature });
        }
      },
      chat: {
        completions: {
          create: async ({ model, messages, temperature = 0.2 }) => {
            const result = await geminiGenerate({ model, messages, temperature });
            return {
              choices: [{ message: { content: result.output_text || '' } }]
            };
          }
        }
      }
    };
  }

  if (options.forceNew || !cachedClient) {
    const apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    cachedClient = new OpenAI({ apiKey });
  }

  return cachedClient;
}
