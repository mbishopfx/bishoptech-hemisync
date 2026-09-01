export type JsonObject = Record<string, unknown>;

export interface CognistrationClientOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  accessToken?: string;
}

export interface McpResponse<T = unknown> {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: { code: number; message: string; data?: unknown };
}

export class CognistrationClient {
  readonly baseUrl: string;
  private readonly request: typeof globalThis.fetch;
  private readonly accessToken?: string;

  constructor(options: CognistrationClientOptions = {}) {
    this.baseUrl = (options.baseUrl || 'https://cognistration.com').replace(/\/$/, '');
    this.request = options.fetch || globalThis.fetch.bind(globalThis);
    this.accessToken = options.accessToken;
  }

  async mcp<T = unknown>(method: string, params: JsonObject = {}, id = `sdk-${Date.now()}`): Promise<McpResponse<T>> {
    const response = await this.request(`${this.baseUrl}/api/mcp`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'MCP-Protocol-Version': '2026-07-28',
        'Mcp-Method': method,
        ...(this.accessToken ? { authorization: `Bearer ${this.accessToken}` } : {})
      },
      body: JSON.stringify({ jsonrpc: '2.0', id, method, params })
    });
    return response.json() as Promise<McpResponse<T>>;
  }

  async capabilities<T = JsonObject>(): Promise<T> {
    const response = await this.request(`${this.baseUrl}/api/capabilities`);
    if (!response.ok) throw new Error(`Cognistration capabilities request failed (${response.status})`);
    return response.json() as Promise<T>;
  }

  async searchTonePacks(query = '', limit = 8): Promise<JsonObject> {
    const params = new URLSearchParams({ agent: '1', limit: String(limit) });
    if (query) params.set('query', query);
    const response = await this.request(`${this.baseUrl}/api/packs?${params}`);
    if (!response.ok) throw new Error(`Cognistration tone-pack request failed (${response.status})`);
    return response.json() as Promise<JsonObject>;
  }
}

export default CognistrationClient;
