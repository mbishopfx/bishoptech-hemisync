#!/usr/bin/env node

/**
 * Read-only release audit for the public Cognistration agent surfaces.
 *
 * The default run exercises the production MCP endpoint, all public MCP
 * tools, all listed resources and skills, protocol failure boundaries, the
 * REST/OpenAPI fallbacks, UCP discovery, and provider-gated payment
 * challenges. It never submits credentials, feedback, checkout confirmation,
 * or a payment credential. Use --browser to add a real homepage WebMCP
 * registration smoke test when Playwright and a Chromium binary are present.
 */

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import {
  MCP_LEGACY_PROTOCOL_VERSION,
  MCP_PROTOCOL_VERSION,
  MCP_RESOURCES,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
  MCP_SUPPORTED_LEGACY_VERSIONS,
  MCP_TOOLS,
  MCP_PROMPTS,
  capabilityManifest
} from '../lib/agentic/mcp-contract.js';
import {
  MEMBER_WEBMCP_TOOL_DEFINITIONS,
  WEBMCP_TOOL_DEFINITIONS,
  memberWebMcpManifestTools,
  webMcpManifestTools
} from '../lib/agentic/webmcp-contract.js';
import { PUBLIC_TONE_CATALOG } from '../lib/agentic/tone-capability.js';
import { PUBLIC_TONE_PACK_CATALOG } from '../lib/agentic/pack-capability.js';
import { UCP_MCP_TOOLS, UCP_MCP_PROTOCOL_VERSION } from '../lib/commerce/ucp-contract.mjs';

const DEFAULT_SITE_ORIGIN = 'https://cognistration.com';
const DEFAULT_MCP_ENDPOINT = `${DEFAULT_SITE_ORIGIN}/api/mcp`;
const DEFAULT_AUDIT_PACE_MS = 550;
const MODERN_SERVER_INFO_META = 'io.modelcontextprotocol/serverInfo';
const MODERN_PROTOCOL_VERSION_META = 'io.modelcontextprotocol/protocolVersion';
const SKILL_EXTENSION = 'io.modelcontextprotocol/skills';
const UI_MIME = 'text/html;profile=mcp-app';
const timeoutMs = numericOption('--timeout', 20000);
const paceMs = numericOption('--pace-ms', Number(process.env.COGNISTRATION_MCP_AUDIT_PACE_MS) || DEFAULT_AUDIT_PACE_MS);
const retry429Ms = numericOption('--retry-429-ms', Number(process.env.COGNISTRATION_MCP_AUDIT_RETRY_429_MS) || 15000);
const siteOrigin = normalizeOrigin(process.env.COGNISTRATION_SITE_ORIGIN || DEFAULT_SITE_ORIGIN);
// Keep canonical identity checks pointed at the public site while allowing a
// local server to receive the same request matrix during release verification.
const httpOrigin = normalizeOrigin(process.env.COGNISTRATION_HTTP_ORIGIN || siteOrigin);
const endpoint = process.env.COGNISTRATION_MCP_ENDPOINT || option('--endpoint') || DEFAULT_MCP_ENDPOINT;
const requestOrigin = process.env.COGNISTRATION_MCP_ORIGIN || siteOrigin;
const reportPath = resolve(process.env.COGNISTRATION_MCP_AUDIT_REPORT || option('--report') || 'output/audits/mcp-audit-latest.json');
const browserRequested = hasFlag('--browser');
const skipRest = hasFlag('--skip-rest');
const skipUcp = hasFlag('--skip-ucp');
const requestLog = [];
const checks = [];
let requestId = 0;
let lastRequestAt = 0;

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function option(flag) {
  const index = process.argv.indexOf(flag);
  if (index < 0) return null;
  return process.argv[index + 1] || null;
}

function numericOption(flag, fallback) {
  const value = Number(option(flag));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeOrigin(value) {
  return String(value).trim().replace(/\/+$/, '');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function redact(value) {
  return String(value || '')
    .replace(/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]+\b/g, '[redacted-key]')
    .replace(/\bwhsec_[A-Za-z0-9]+\b/g, '[redacted-secret]')
    .replace(/\bservice_role\b/gi, '[redacted-role]')
    .replace(/(Authorization|Payment-Authorization|Payment-Receipt|Bearer)\s*[:=]?\s+[^\s,;]+/gi, '$1 [redacted-value]');
}

function shortEvidence(value) {
  if (value == null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return redact(value).slice(0, 800);
  if (Array.isArray(value)) return { count: value.length, sample: value.slice(0, 4).map(shortEvidence) };
  if (typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value).slice(0, 24)) result[key] = shortEvidence(value[key]);
    return result;
  }
  return String(value);
}

async function runCheck(id, category, fn, { severity = 'high' } = {}) {
  const started = Date.now();
  try {
    const evidence = await fn();
    checks.push({ id, category, status: 'pass', severity, durationMs: Date.now() - started, evidence: shortEvidence(evidence) });
    return evidence;
  } catch (error) {
    checks.push({ id, category, status: 'fail', severity, durationMs: Date.now() - started, error: redact(error?.message || String(error)) });
    return null;
  }
}

function skipCheck(id, category, reason) {
  checks.push({ id, category, status: 'skip', severity: 'info', durationMs: 0, reason });
}

function pathUrl(path) {
  return new URL(path, httpOrigin).toString();
}

async function http(urlOrPath, init = {}) {
  const url = pathUrl(urlOrPath);
  const method = init.method || 'GET';
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < paceMs) await new Promise((resolvePromise) => setTimeout(resolvePromise, paceMs - elapsed));
  lastRequestAt = Date.now();
  let response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('retry-after'));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 59000) : retry429Ms;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, waitMs));
    lastRequestAt = Date.now();
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  }
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // HTML, Markdown, and SSE responses are intentionally left as text.
  }
  requestLog.push({ method, url: new URL(url).pathname, status: response.status });
  return { url, response, text, json };
}

function modernMeta() {
  return { [MODERN_PROTOCOL_VERSION_META]: MCP_PROTOCOL_VERSION };
}

function mcpRequestBody(method, params, id) {
  return { jsonrpc: '2.0', id, method, params };
}

async function mcpRaw(method, params = {}, options = {}) {
  const modern = options.modern !== false;
  const protocol = options.protocol || (modern ? MCP_PROTOCOL_VERSION : MCP_LEGACY_PROTOCOL_VERSION);
  const id = options.id || `audit-${++requestId}`;
  const bodyParams = { ...params };
  if (modern && options.bodyMeta !== false) bodyParams._meta = options.bodyMeta || modernMeta();

  const headers = {
    accept: options.accept || 'application/json',
    'content-type': 'application/json'
  };
  if (options.originHeader !== false) headers.Origin = options.originHeader || requestOrigin;
  if (options.protocolHeader !== false) headers['MCP-Protocol-Version'] = options.protocolHeader || protocol;
  if (options.methodHeader !== false) headers['Mcp-Method'] = options.methodHeader || method;

  const expectedName = options.name || (
    method === 'tools/call' ? bodyParams.name :
      method === 'resources/read' ? bodyParams.uri :
        method === 'prompts/get' ? bodyParams.name : null
  );
  if (options.nameHeader !== false && expectedName) headers['Mcp-Name'] = options.nameHeader || expectedName;

  return http(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(mcpRequestBody(method, bodyParams, id))
  });
}

function assertJsonRpc(responseRecord, label) {
  assert(responseRecord.response.ok, `${label} returned HTTP ${responseRecord.response.status}: ${responseRecord.json?.error?.message || redact(responseRecord.text).slice(0, 180)}`);
  assert(responseRecord.json?.jsonrpc === '2.0', `${label} did not return JSON-RPC 2.0.`);
  assert(!responseRecord.json?.error, `${label} returned MCP error ${responseRecord.json?.error?.code}: ${responseRecord.json?.error?.message}`);
  assert(responseRecord.json.result !== undefined, `${label} returned no result.`);
  return responseRecord.json.result;
}

function assertModernEnvelope(result, label) {
  assert(result?.resultType === 'complete', `${label} is missing resultType=complete.`);
  assert(result?._meta?.[MODERN_SERVER_INFO_META]?.name === MCP_SERVER_NAME, `${label} is missing the server info metadata.`);
  assert(result?._meta?.[MODERN_SERVER_INFO_META]?.version === MCP_SERVER_VERSION, `${label} has the wrong server info version.`);
}

async function mcp(method, params = {}, options = {}) {
  const responseRecord = await mcpRaw(method, params, options);
  const result = assertJsonRpc(responseRecord, method);
  if (options.modern !== false) assertModernEnvelope(result, method);
  return result;
}

async function expectedMcpError(method, params, options = {}, { status, code } = {}) {
  const responseRecord = await mcpRaw(method, params, options);
  if (status !== undefined) assert(responseRecord.response.status === status, `${method} returned HTTP ${responseRecord.response.status}; expected ${status}.`);
  assert(responseRecord.json?.jsonrpc === '2.0', `${method} error response was not JSON-RPC 2.0.`);
  assert(responseRecord.json?.error, `${method} unexpectedly succeeded.`);
  assertNoSecretLeak(responseRecord.json, `${method} error response`);
  if (code !== undefined) assert(responseRecord.json.error.code === code, `${method} returned code ${responseRecord.json.error.code}; expected ${code}.`);
  return { status: responseRecord.response.status, code: responseRecord.json.error.code, message: responseRecord.json.error.message };
}

function structured(result) {
  return result?.structuredContent || result;
}

function parseToolEnvelope(result, name) {
  assert(result?.content?.[0]?.type === 'text', `${name} did not return a text content block.`);
  const text = result.content[0].text;
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`${name} returned non-JSON tool text.`);
  }
  assert(stable(payload) === stable(result.structuredContent), `${name} content text and structuredContent differ.`);
  return payload;
}

function assertNoSecretLeak(value, label) {
  const serialized = JSON.stringify(value);
  assert(!/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]+\b/.test(serialized), `${label} exposed a Stripe key pattern.`);
  assert(!/\bwhsec_[A-Za-z0-9]+\b/.test(serialized), `${label} exposed a webhook secret pattern.`);
  assert(!/service_role/i.test(serialized), `${label} exposed a service-role marker.`);
  assert(!/-----BEGIN [A-Z ]+ PRIVATE KEY-----/.test(serialized), `${label} exposed a private key.`);
  assert(!/password\s*[:=]\s*['"][^'"]+['"]/i.test(serialized), `${label} exposed a password value.`);
}

function schemaTypeMatches(value, type) {
  if (type === 'null') return value === null;
  if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (type === 'array') return Array.isArray(value);
  if (type === 'string') return typeof value === 'string';
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (type === 'boolean') return typeof value === 'boolean';
  return true;
}

function validateSchema(value, schema, path = '$') {
  if (!schema || typeof schema !== 'object') return null;
  if (schema.anyOf) {
    const errors = schema.anyOf.map((candidate) => validateSchema(value, candidate, path)).filter(Boolean);
    return errors.length === schema.anyOf.length ? `${path} did not match any schema branch.` : null;
  }
  if (schema.oneOf) {
    const matches = schema.oneOf.filter((candidate) => !validateSchema(value, candidate, path));
    return matches.length === 1 ? null : `${path} did not match exactly one schema branch.`;
  }
  if (schema.allOf) {
    for (const candidate of schema.allOf) {
      const error = validateSchema(value, candidate, path);
      if (error) return error;
    }
  }
  if (schema.const !== undefined && stable(value) !== stable(schema.const)) return `${path} did not equal its published constant.`;
  if (schema.enum && !schema.enum.some((candidate) => stable(candidate) === stable(value))) return `${path} was outside its published enum.`;
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => schemaTypeMatches(value, type))) return `${path} has the wrong type.`;
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) return `${path} is shorter than minLength.`;
    if (schema.maxLength !== undefined && value.length > schema.maxLength) return `${path} is longer than maxLength.`;
    if (schema.pattern && !(new RegExp(schema.pattern).test(value))) return `${path} does not match its pattern.`;
    if (schema.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `${path} is not an email.`;
    if (schema.format === 'uri') {
      try { new URL(value); } catch { return `${path} is not an absolute URI.`; }
    }
    if (schema.format === 'uri-reference' && /\s/.test(value)) return `${path} is not a URI reference.`;
    if (schema.format === 'date-time' && !Number.isFinite(Date.parse(value))) return `${path} is not a date-time.`;
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) return `${path} is below minimum.`;
    if (schema.maximum !== undefined && value > schema.maximum) return `${path} is above maximum.`;
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) return `${path} has too few items.`;
    if (schema.maxItems !== undefined && value.length > schema.maxItems) return `${path} has too many items.`;
    if (schema.items) {
      for (let index = 0; index < value.length; index += 1) {
        const error = validateSchema(value[index], schema.items, `${path}[${index}]`);
        if (error) return error;
      }
    }
  }
  if (schema.type === 'object' || (schema.properties && value && typeof value === 'object' && !Array.isArray(value))) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return `${path} is not an object.`;
    for (const key of schema.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) return `${path}.${key} is required.`;
    }
    const properties = schema.properties || {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) return `${path}.${key} is not published.`;
      }
    }
    for (const [key, childSchema] of Object.entries(properties)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        const error = validateSchema(value[key], childSchema, `${path}.${key}`);
        if (error) return error;
      }
    }
  }
  return null;
}

function assertSchema(value, schema, label) {
  const error = validateSchema(value, schema);
  assert(!error, `${label} failed its published schema: ${error}`);
}

function digest(text) {
  return `sha256:${createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex')}`;
}

function toolResultFrom(result, name, { error = false } = {}) {
  const envelope = structured(result);
  const payload = parseToolEnvelope(result, name);
  if (error) {
    assert(result.isError === true, `${name} should have returned isError=true.`);
    assert(payload?.error?.code, `${name} error payload is missing a safe error code.`);
    return payload;
  }
  assert(result.isError === false, `${name} unexpectedly returned a tool error.`);
  assertNoSecretLeak(payload, name);
  return envelope;
}

function comparableTool(tool) {
  return {
    name: tool.name,
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema,
    outputSchema: tool.outputSchema,
    annotations: tool.annotations,
    authorization: tool.authorization,
    sideEffect: tool.sideEffect,
    consent: tool.consent,
    _meta: tool._meta
  };
}

function requireUnique(items, label) {
  const names = items.map((item) => item.name || item.uri);
  assert(new Set(names).size === names.length, `${label} contains duplicate names or URIs.`);
}

function localFixtureMap() {
  const toneId = PUBLIC_TONE_CATALOG[0]?.id;
  const packSlug = PUBLIC_TONE_PACK_CATALOG[0]?.slug || 'full-spectrum-pack';
  const fakeKey = 'audit_fake_workshop_key_000000000000';
  return {
    get_agentic_capabilities: {},
    compose_session_score: {
      direction: 'focus',
      durationSec: 600,
      sound: {
        entrainmentModes: { binaural: true, monaural: true, isochronic: true },
        background: { type: 'ocean', mixDb: -24 },
        breathGuide: { enabled: true, pattern: 'box', bpm: 4 },
        fades: { inSec: 5, outSec: 8 }
      }
    },
    search_public_tones: { query: 'focus', state: 'theta', limit: 3 },
    get_public_tone: { id: toneId },
    recommend_tone: { intention: 'a calm reset before writing' },
    clarify_intention: { intention: 'I need something better' },
    calibrate_tone: { feedback: 'too_intense', targetState: 'theta', carrierHz: 200, beatHz: 6, volume: 72 },
    compare_tone_directions: { intention: 'a calm reset before writing', limit: 3 },
    plan_listening_session: { intention: 'a calm reset before writing', durationMin: 20, mode: 'reflect', targetState: 'theta' },
    get_session_cue: { intention: 'a calm reset before writing', mode: 'reflect' },
    prepare_session_recipe: { targetState: 'theta', carrierHz: 200, beatHz: 6, volume: 72, durationSec: 120, intentionLabel: 'reflect' },
    search_public_tone_packs: { query: 'focus', state: 'theta', limit: 3 },
    get_public_tone_pack: { slug: packSlug },
    get_policy_info: { topic: 'safety' },
    get_account_options: {},
    open_account_signup: {},
    get_ios_app_offer: {},
    open_phone_download_options: { targetState: 'theta', carrierHz: 200, beatHz: 6, volume: 72 },
    create_tone_pack_checkout: { slug: packSlug, email: 'audit@example.invalid', confirmed: false, idempotencyKey: 'audit-pack-nocharge-01' },
    get_tone_pack_delivery: { slug: packSlug, checkoutSessionId: 'cs_audit_not_paid' },
    open_tone_pack_checkout: { slug: packSlug },
    create_workshop_access_checkout: { email: 'audit@example.invalid', confirmed: false, idempotencyKey: 'audit-workshop-nocharge-01' },
    get_workshop_access: { checkoutSessionId: 'cs_audit_not_paid' },
    get_workshop_access_status: { accessKey: fakeKey },
    revoke_workshop_access: { accessKey: fakeKey, confirmed: false },
    get_machine_payment_options: {},
    get_tone_pack_payment_options: {},
    get_autonomous_payment_options: {},
    get_machine_control_contract: {},
    set_machine_controls: { targetState: 'gamma', carrierHz: 246, beatHz: 18, volume: 64 },
    adjust_machine_controls: { control: 'rhythm', direction: 'faster', step: 1, currentControls: { targetState: 'gamma', carrierHz: 246, beatHz: 18, volume: 64 } },
    set_machine_direction: { targetState: 'alpha' },
    start_machine_preview: { confirmed: true },
    stop_machine_preview: {},
    open_machine_fullscreen: {},
    open_machine_generator: { intention: 'a calm reset before writing' },
    open_science_guide: { targetState: 'gamma', carrierHz: 246, beatHz: 6, volume: 64, intentionLabel: 'synthesis' },
    open_feedback: {}
  };
}

async function auditLocalContracts() {
  await runCheck('local.registry.integrity', 'contract', () => {
    requireUnique(MCP_TOOLS, 'MCP tools');
    requireUnique(MCP_RESOURCES, 'MCP resources');
    requireUnique(MCP_PROMPTS, 'MCP prompts');
    requireUnique(WEBMCP_TOOL_DEFINITIONS, 'public WebMCP tools');
    requireUnique(MEMBER_WEBMCP_TOOL_DEFINITIONS, 'member WebMCP tools');
    requireUnique(UCP_MCP_TOOLS, 'UCP tools');
    assert(MCP_TOOLS.length === 38, `local MCP tool count is ${MCP_TOOLS.length}, expected 38.`);
    assert(MCP_RESOURCES.length === 17, `local MCP resource count is ${MCP_RESOURCES.length}, expected 17.`);
    assert(WEBMCP_TOOL_DEFINITIONS.length === 28, `local public WebMCP tool count is ${WEBMCP_TOOL_DEFINITIONS.length}, expected 28.`);
    assert(MEMBER_WEBMCP_TOOL_DEFINITIONS.length === 11, `local member WebMCP tool count is ${MEMBER_WEBMCP_TOOL_DEFINITIONS.length}, expected 11.`);
    assert(MCP_PROTOCOL_VERSION === '2026-07-28', 'current MCP protocol version drifted.');
    assert(MCP_SUPPORTED_LEGACY_VERSIONS.includes(MCP_LEGACY_PROTOCOL_VERSION), 'legacy MCP version is not in the supported list.');
    assert(UCP_MCP_PROTOCOL_VERSION === MCP_PROTOCOL_VERSION, 'UCP and public MCP protocol versions drifted.');
    const manifestBytes = Buffer.byteLength(JSON.stringify(capabilityManifest(siteOrigin)));
    assert(manifestBytes <= 64 * 1024, `capability manifest is ${manifestBytes} bytes and exceeds the public tool-text limit.`);
    return { mcpTools: MCP_TOOLS.length, resources: MCP_RESOURCES.length, publicWebMcp: WEBMCP_TOOL_DEFINITIONS.length, memberWebMcp: MEMBER_WEBMCP_TOOL_DEFINITIONS.length, ucpTools: UCP_MCP_TOOLS.length, manifestBytes };
  });

  await runCheck('local.input-schema-privacy', 'security', () => {
    for (const tool of MCP_TOOLS) {
      assert(tool.inputSchema?.type === 'object', `${tool.name} has no object input schema.`);
      assert(tool.inputSchema.additionalProperties === false, `${tool.name} permits undeclared input properties.`);
      assert(tool.outputSchema, `${tool.name} has no output schema.`);
      assert(tool.authorization, `${tool.name} has no authorization classification.`);
      assert(tool.sideEffect, `${tool.name} has no side-effect classification.`);
      assert(typeof tool.annotations?.readOnlyHint === 'boolean', `${tool.name} has incomplete annotations.`);
      const inputText = JSON.stringify(tool.inputSchema);
      assert(!/(password|cardNumber|cvc|paymentCredential|secretKey|apiKey)/i.test(inputText), `${tool.name} publishes a credential-shaped input field.`);
    }
    for (const tool of [...WEBMCP_TOOL_DEFINITIONS, ...MEMBER_WEBMCP_TOOL_DEFINITIONS]) {
      assert(tool.inputSchema?.additionalProperties === false, `${tool.name} permits undeclared WebMCP input properties.`);
    }
    return { checkedPublicInputs: MCP_TOOLS.length, checkedWebMcpInputs: WEBMCP_TOOL_DEFINITIONS.length + MEMBER_WEBMCP_TOOL_DEFINITIONS.length };
  });

  await runCheck('local.widget-boundaries', 'ui-security', () => {
    const uiResources = MCP_RESOURCES.filter((resource) => resource.mimeType === UI_MIME);
    assert(uiResources.length === 7, `expected seven MCP Apps resources, found ${uiResources.length}.`);
    for (const resource of uiResources) {
      assert(resource._meta?.ui?.domain === siteOrigin, `${resource.uri} has a non-canonical widget domain.`);
      assert(resource._meta?.ui?.csp?.connectDomains?.every((value) => value === siteOrigin), `${resource.uri} has an unexpected connect domain.`);
      assert(resource._meta?.ui?.csp?.resourceDomains?.every((value) => value === siteOrigin || value === 'https://esm.sh' || /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value)), `${resource.uri} has an unexpected resource domain.`);
      assert(resource._meta?.['openai/widgetCSP'], `${resource.uri} is missing host CSP metadata.`);
      assert(resource._meta?.['openai/outputTemplate'] === undefined || resource._meta?.['openai/outputTemplate'] === resource.uri, `${resource.uri} has a mismatched output template.`);
    }
    const machine = uiResources.find((resource) => resource.uri.includes('/machine-generator/'));
    const science = uiResources.find((resource) => resource.uri.includes('/science-guide/'));
    assert(uiResources.every((resource) => resource._meta?.ui?.prefersBorder === false), 'an MCP Apps resource requests a host-added border.');
    assert(machine?._meta?.ui?.prefersBorder === false, 'machine resource requests a host border.');
    assert(science?._meta?.ui?.prefersBorder === false, 'science resource requests a host border.');
    return { uiResources: uiResources.map((resource) => ({ uri: resource.uri, prefersBorder: resource._meta?.ui?.prefersBorder })) };
  });
}

async function auditDiscovery() {
  const health = await runCheck('mcp.http.get', 'protocol', async () => {
    const record = await http(endpoint, { headers: { accept: 'application/json', Origin: requestOrigin } });
    assert(record.response.ok, `MCP GET returned HTTP ${record.response.status}.`);
    assert(record.json?.service === MCP_SERVER_NAME, 'MCP GET service name is wrong.');
    assert(record.json?.endpoint === endpoint, `MCP GET endpoint is ${record.json?.endpoint}, expected ${endpoint}.`);
    assert(record.response.headers.get('cache-control') === 'no-store', 'MCP GET should be no-store.');
    assert(record.response.headers.get('access-control-allow-origin') === requestOrigin, 'MCP GET did not return the exact requesting origin for CORS.');
    assert((record.response.headers.get('vary') || '').toLowerCase().split(',').map((value) => value.trim()).includes('origin'), 'MCP GET is missing Vary: Origin.');
    return { status: record.response.status, protocols: record.json.protocols, transport: record.json.transport };
  });

  const discovery = await runCheck('mcp.discovery.server-discover', 'discovery', async () => {
    const result = await mcp('server/discover');
    assert(result.supportedVersions?.length === 1 && result.supportedVersions[0] === MCP_PROTOCOL_VERSION, 'server/discover does not advertise the current protocol only.');
    assert(result.capabilities?.extensions?.[SKILL_EXTENSION], 'server/discover does not advertise the skills extension.');
    assert(typeof result.instructions === 'string' && result.instructions.length > 300, 'server/discover instructions are missing.');
    return { supportedVersions: result.supportedVersions, skillExtension: Boolean(result.capabilities.extensions[SKILL_EXTENSION]), resultType: result.resultType };
  });

  const toolsResult = await runCheck('mcp.discovery.tools-list', 'discovery', async () => {
    const result = await mcp('tools/list');
    assert(stable(result.tools) === stable(MCP_TOOLS), 'live tools/list differs from the checked-in public tool registry.');
    assert(result.ttlMs === 0 && result.cacheScope === 'private', 'tools/list cache metadata is missing.');
    return { count: result.tools.length, names: result.tools.map((tool) => tool.name) };
  });

  const resourcesResult = await runCheck('mcp.discovery.resources-list', 'discovery', async () => {
    const result = await mcp('resources/list');
    assert(stable(result.resources) === stable(MCP_RESOURCES), 'live resources/list differs from the checked-in resource registry.');
    return { count: result.resources.length, uiResources: result.resources.filter((resource) => resource.mimeType === UI_MIME).length };
  });

  await runCheck('mcp.discovery.prompts-list', 'discovery', async () => {
    const result = await mcp('prompts/list');
    assert(stable(result.prompts) === stable(MCP_PROMPTS), 'live prompts/list differs from the checked-in prompt registry.');
    return { count: result.prompts.length, names: result.prompts.map((prompt) => prompt.name) };
  });

  await runCheck('mcp.discovery.legacy-initialize', 'protocol', async () => {
    const result = await mcp('initialize', {
      protocolVersion: MCP_LEGACY_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: 'cognistration-readonly-audit', version: '1.0.0' }
    }, { modern: false, protocol: MCP_LEGACY_PROTOCOL_VERSION, methodHeader: false, nameHeader: false });
    assert(result.protocolVersion === MCP_LEGACY_PROTOCOL_VERSION, 'legacy initialize did not negotiate the requested legacy version.');
    assert(result.capabilities?.tools && result.serverInfo?.name === MCP_SERVER_NAME, 'legacy initialize is missing server capabilities.');
    return { protocolVersion: result.protocolVersion, serverInfo: result.serverInfo };
  });

  await runCheck('mcp.discovery.legacy-tools-list', 'protocol', async () => {
    const result = await mcp('tools/list', {}, { modern: false, protocol: MCP_LEGACY_PROTOCOL_VERSION, methodHeader: false, nameHeader: false });
    assert(stable(result.tools) === stable(MCP_TOOLS), 'legacy tools/list differs from the public registry.');
    assert(result.resultType === undefined, 'legacy tools/list unexpectedly returned modern result metadata.');
    return { count: result.tools.length, protocol: MCP_LEGACY_PROTOCOL_VERSION };
  });

  await runCheck('mcp.discovery.initialize-modern-compatible', 'protocol', async () => {
    const result = await mcp('initialize', {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: 'cognistration-standard-compatibility-audit', version: '1.0.0' }
    }, { bodyMeta: false, methodHeader: false });
    assert(result.protocolVersion === MCP_PROTOCOL_VERSION, 'modern initialize did not negotiate the requested protocol version.');
    assert(result.capabilities?.tools && result.serverInfo?.name === MCP_SERVER_NAME, 'modern initialize is missing server capabilities.');
    return { protocolVersion: result.protocolVersion, serverInfo: result.serverInfo };
  });
  await runCheck('mcp.discovery.ping', 'protocol', async () => {
    const result = await mcp('ping');
    assert(Object.keys(result).sort().join(',') === '_meta,resultType', 'ping returned an unexpected payload.');
    return { resultType: result.resultType, server: result._meta?.[MODERN_SERVER_INFO_META] };
  });

  return { health, tools: toolsResult, resources: resourcesResult, discovery };
}

async function auditResources() {
  const resources = MCP_RESOURCES;
  for (const resource of resources) {
    await runCheck(`mcp.resource.read.${resource.uri}`, 'resources', async () => {
      const result = await mcp('resources/read', { uri: resource.uri });
      const content = result.contents?.[0];
      assert(content?.uri === resource.uri, `${resource.uri} returned the wrong resource URI.`);
      assert(content?.mimeType === resource.mimeType, `${resource.uri} returned MIME ${content?.mimeType}, expected ${resource.mimeType}.`);
      assert(typeof content.text === 'string' && content.text.length > 20, `${resource.uri} returned empty content.`);
      if (resource.mimeType === 'application/json') {
        const payload = JSON.parse(content.text);
        assertNoSecretLeak(payload, resource.uri);
      } else if (resource.mimeType === UI_MIME) {
        assert(/^<!doctype html>/i.test(content.text), `${resource.uri} is not a complete HTML document.`);
        assert(/<meta[^>]+viewport/i.test(content.text), `${resource.uri} is missing a viewport meta tag.`);
        const iframeTags = [...content.text.matchAll(/<iframe\b[^>]*>/gi)].map((match) => match[0]);
        for (const iframe of iframeTags) {
          const src = iframe.match(/\bsrc=["']([^"']+)["']/i)?.[1] || '';
          const sandbox = iframe.match(/\bsandbox=["']([^"']+)["']/i)?.[1]?.split(/\s+/).filter(Boolean) || [];
          assert(src.startsWith(`${siteOrigin}/`), `${resource.uri} embeds a non-canonical iframe.`);
          assert(sandbox.includes('allow-scripts'), `${resource.uri} iframe is missing allow-scripts sandboxing.`);
          assert(!sandbox.some((token) => ['allow-same-origin', 'allow-forms', 'allow-top-navigation', 'allow-popups'].includes(token)), `${resource.uri} iframe has an unsafe sandbox escape.`);
        }
        assert(!/window\.openai\.callTool\s*\([^)]*(?:password|card|secret|credential)/is.test(content.text), `${resource.uri} appears to send credentials through the host tool bridge.`);
        assertNoSecretLeak(content.text, resource.uri);
      }
      return { uri: content.uri, mimeType: content.mimeType, bytes: Buffer.byteLength(content.text) };
    });
  }

  const compatibilityUris = [
    'ui://cognistration/machine-generator/v2.html',
    'ui://cognistration/machine-generator/v1.html',
    'ui://cognistration/science-guide/v1.html',
    'ui://cognistration/account-signup/v2.html',
    'ui://cognistration/account-signup/v1.html'
  ];
  for (const uri of compatibilityUris) {
    await runCheck(`mcp.resource.compatibility.${uri}`, 'resources', async () => {
      const result = await mcp('resources/read', { uri });
      const content = result.contents?.[0];
      assert(content?.uri === uri && content?.mimeType === UI_MIME, `${uri} compatibility resource is not readable.`);
      assert(content.text.includes('<!doctype html>'), `${uri} compatibility resource is not HTML.`);
      return { uri, bytes: Buffer.byteLength(content.text) };
    }, { severity: 'medium' });
  }

  const skills = [];
  let cursor;
  for (let page = 0; page < 10; page += 1) {
    const result = await mcp('skills/list', cursor ? { cursor } : {});
    skills.push(...(result.skills || []));
    if (!result.nextCursor) break;
    assert(result.nextCursor !== cursor, 'skills/list cursor did not advance.');
    cursor = result.nextCursor;
  }
  await runCheck('mcp.skills.catalog', 'skills', () => {
    assert(skills.length === 5, `skills/list returned ${skills.length}, expected five.`);
    assert(skills.every((skill) => skill.uri && skill.frontmatter?.name && skill.resources?.[0]?.digest?.startsWith('sha256:')), 'skill entry is missing frontmatter or digest.');
    return { count: skills.length, names: skills.map((skill) => skill.frontmatter.name) };
  });

  for (const entry of skills) {
    await runCheck(`mcp.skill.get.${entry.frontmatter.name}`, 'skills', async () => {
      const result = await mcp('skills/get', { uri: entry.uri });
      assert(result.skill?.uri === entry.uri, `${entry.uri} returned the wrong skill.`);
      assert(result.skill?.resources?.[0]?.digest === entry.resources?.[0]?.digest, `${entry.uri} digest changed between skills/list and skills/get.`);
      return { name: result.skill.frontmatter.name, digest: result.skill.resources[0].digest };
    });
    await runCheck(`mcp.skill.resource.${entry.frontmatter.name}`, 'skills', async () => {
      const result = await mcp('resources/read', { uri: entry.uri });
      const content = result.contents?.[0];
      assert(content?.mimeType === 'text/markdown' && content.text, `${entry.uri} did not return markdown content.`);
      assert(digest(content.text) === entry.resources?.[0]?.digest, `${entry.uri} content digest does not match the published digest.`);
      assertNoSecretLeak(content.text, entry.uri);
      return { name: entry.frontmatter.name, digest: digest(content.text), bytes: Buffer.byteLength(content.text) };
    });
  }

  await runCheck('mcp.prompt.get.valid', 'prompts', async () => {
    const result = await mcp('prompts/get', { name: 'choose_session_tone', arguments: { intention: 'a calm reset before writing' } });
    assert(result.messages?.[0]?.role === 'user', 'prompt did not return a user message.');
    assert(/<a calm reset before writing>/.test(result.messages[0].content?.text || ''), 'valid prompt intention was not bounded into the prompt.');
    assertNoSecretLeak(result, 'choose_session_tone');
    return { messageCount: result.messages.length };
  });
  await runCheck('mcp.prompt.get.invalid', 'prompts', async () => expectedMcpError('prompts/get', { name: 'not-a-prompt', arguments: {} }, { code: -32602 }), { severity: 'medium' });
  await runCheck('mcp.skills.cursor.invalid', 'skills', async () => expectedMcpError('skills/list', { cursor: 'not-a-cursor' }, { code: -32602 }), { severity: 'medium' });
}

async function callPublicTool(name, args, toolDefinition) {
  const result = await mcp('tools/call', { name, arguments: args });
  const payload = toolResultFrom(result, name);
  assertSchema(payload, toolDefinition.outputSchema, name);
  return { payload, envelope: result };
}

async function auditTools() {
  const fixtures = localFixtureMap();
  const expectedDenied = new Map([
    ['create_tone_pack_checkout', 'CONFIRMATION_REQUIRED'],
    ['get_tone_pack_delivery', null],
    ['create_workshop_access_checkout', 'CONFIRMATION_REQUIRED'],
    ['get_workshop_access', null],
    ['revoke_workshop_access', 'CONFIRMATION_REQUIRED']
  ]);
  const observed = {};

  for (const tool of MCP_TOOLS) {
    const args = fixtures[tool.name];
    assert(args !== undefined, `No safe audit fixture exists for ${tool.name}.`);
    await runCheck(`mcp.tool.call.${tool.name}`, 'tools', async () => {
      if (expectedDenied.has(tool.name)) {
        const result = await mcp('tools/call', { name: tool.name, arguments: args });
        const payload = toolResultFrom(result, tool.name, { error: true });
        if (expectedDenied.get(tool.name)) assert(payload.error.code === expectedDenied.get(tool.name), `${tool.name} returned ${payload.error.code}; expected ${expectedDenied.get(tool.name)}.`);
        assertNoSecretLeak(payload, tool.name);
        observed[tool.name] = { status: 'safe-denial', code: payload.error.code };
        return observed[tool.name];
      }
      const { payload, envelope } = await callPublicTool(tool.name, args, tool);
      observed[tool.name] = { status: 'completed', keys: Object.keys(payload).slice(0, 16) };
      if (tool.name === 'open_account_signup') assert(payload.credentialsSubmitted === false && payload.paymentSubmitted === false, 'signup tool crossed its credential/payment boundary.');
      if (tool.name === 'open_feedback') assert(payload.persisted === false, 'feedback render tool persisted data.');
      if (tool.name === 'open_tone_pack_checkout') assert(payload.paymentSubmitted === false && payload.userSubmissionRequired === true, 'tone-pack render tool crossed its payment boundary.');
      if (tool.name === 'start_machine_preview') {
        assert(payload.status === 'requested' && payload.audioReady === false && payload.requiresUserGesture === true, 'machine start did not preserve browser-audio verification boundary.');
      }
      if (tool.name === 'stop_machine_preview') assert(payload.audioAction === 'stop', 'machine stop action is missing.');
      if (tool.name === 'open_science_guide') assert(payload.boundaries?.audioStarted === false && payload.boundaries?.diaryContentIncluded === false, 'science guide crossed audio or diary boundary.');
      if (['set_machine_controls', 'adjust_machine_controls', 'set_machine_direction'].includes(tool.name)) assert(payload.playbackPreserved === true, `${tool.name} did not promise playback preservation.`);
      if (tool.name === 'get_tone_pack_payment_options') assert(payload.amountCents === 599 && payload.acceptsPaymentDetails === false, 'tone-pack payment contract is not fixed/header-only.');
      if (tool.name === 'get_machine_payment_options') assert(payload.amountCents === 50 && payload.acceptsPaymentDetails === false, 'machine payment contract is not fixed/header-only.');
      if (tool.name === 'open_machine_generator') assert(payload.controls?.isPlaying === false, 'machine generator opened while playing.');
      if (tool.name === 'open_phone_download_options') assert(payload.phonePreview?.amountCents === 50 && payload.phonePreview?.requiresExplicitConfirmation === true, 'phone handoff payment boundary is missing.');
      if (tool.name === 'compose_session_score') {
        assert(payload.engine === 'browser-signal-score', 'full-spectrum score engine marker is missing.');
        assert(payload.sound?.entrainmentModes?.monaural === true && payload.sound?.entrainmentModes?.isochronic === true, 'full-spectrum mode routing did not survive MCP composition.');
        assert(payload.sound?.breathGuide?.enabled === true && payload.sound?.background?.type === 'ocean', 'full-spectrum sound profile did not survive MCP composition.');
        assert(payload.stages?.every((stage) => stage.carrierHz >= 50 && stage.carrierHz <= 2000), 'full-spectrum carrier bounds were not returned.');
      }
      if (envelope._meta?.ui?.resourceUri) assert(envelope._meta.ui.resourceUri === tool._meta?.ui?.resourceUri, `${tool.name} UI metadata is not bound to its published tool resource.`);
      return observed[tool.name];
    });
  }

  await runCheck('mcp.tool.safety.medical', 'safety', async () => {
    const result = await mcp('tools/call', { name: 'recommend_tone', arguments: { intention: 'I need a diagnosis for depression' } });
    const payload = toolResultFrom(result, 'recommend_tone');
    assertSchema(payload, MCP_TOOLS.find((tool) => tool.name === 'recommend_tone').outputSchema, 'recommend_tone safety');
    assert(payload.status === 'safety_redirect' && payload.safety?.category === 'medical', 'medical intention did not route to the health boundary.');
    assert(payload.tone === null && payload.boundaries?.audioStarted === false && payload.boundaries?.medicalGuidance === false, 'medical safety response crossed a product boundary.');
    return { status: payload.status, category: payload.safety.category, route: payload.safety.route };
  });
  await runCheck('mcp.tool.safety.crisis', 'safety', async () => {
    const result = await mcp('tools/call', { name: 'recommend_tone', arguments: { intention: 'I am in a crisis and cannot stay safe' } });
    const payload = toolResultFrom(result, 'recommend_tone');
    assert(payload.status === 'safety_redirect' && payload.safety?.category === 'crisis', 'crisis intention did not route to the safety boundary.');
    assert(payload.tone === null && payload.boundaries?.audioStarted === false, 'crisis safety response crossed an audio boundary.');
    return { status: payload.status, category: payload.safety.category, route: payload.safety.route };
  });

  await runCheck('mcp.tool.confirmation.start-denied', 'authorization', async () => {
    const result = await mcp('tools/call', { name: 'start_machine_preview', arguments: { confirmed: false } });
    const payload = toolResultFrom(result, 'start_machine_preview', { error: true });
    assert(payload.error.code === 'CONFIRMATION_REQUIRED', 'unconfirmed audio start was not denied.');
    return payload.error;
  }, { severity: 'critical' });
  await runCheck('mcp.tool.confirmation.revoke-denied', 'authorization', async () => {
    const result = await mcp('tools/call', { name: 'revoke_workshop_access', arguments: { accessKey: 'audit_fake_workshop_key_000000000000', confirmed: false } });
    const payload = toolResultFrom(result, 'revoke_workshop_access', { error: true });
    assert(payload.error.code === 'CONFIRMATION_REQUIRED', 'unconfirmed access revocation was not denied.');
    return payload.error;
  }, { severity: 'critical' });

  return { count: Object.keys(observed).length, observed };
}

async function auditProtocolFailures() {
  await runCheck('mcp.protocol.missing-protocol-header', 'protocol', async () => expectedMcpError('tools/list', {}, { protocolHeader: false }, { status: 400, code: -32020 }));
  await runCheck('mcp.protocol.missing-body-metadata', 'protocol', async () => expectedMcpError('tools/list', {}, { bodyMeta: false }, { status: 400, code: -32020 }));
  await runCheck('mcp.protocol.missing-method-header', 'protocol', async () => expectedMcpError('tools/list', {}, { methodHeader: false }, { status: 400, code: -32020 }));
  await runCheck('mcp.protocol.mismatched-body-header', 'protocol', async () => expectedMcpError('tools/list', {}, { bodyMeta: { [MODERN_PROTOCOL_VERSION_META]: '2025-11-25' } }, { status: 400, code: -32020 }));
  await runCheck('mcp.protocol.wrong-method-header', 'protocol', async () => expectedMcpError('tools/list', {}, { methodHeader: 'resources/list' }, { status: 400, code: -32020 }));
  await runCheck('mcp.protocol.wrong-resource-name-header', 'protocol', async () => expectedMcpError('resources/read', { uri: 'cognistration://tones' }, { nameHeader: 'cognistration://policies' }, { status: 400, code: -32020 }));
  await runCheck('mcp.protocol.unsupported-version', 'protocol', async () => expectedMcpError('tools/list', {}, { protocolHeader: '2024-01-01' }, { status: 400, code: -32022 }));
  await runCheck('mcp.protocol.disallowed-origin', 'security', async () => expectedMcpError('tools/list', {}, { originHeader: 'https://evil.example' }, { status: 403, code: -32003 }), { severity: 'critical' });
  await runCheck('mcp.protocol.unknown-method', 'protocol', async () => expectedMcpError('not/a-method', {}, { code: -32601, status: 404 }), { severity: 'medium' });
  await runCheck('mcp.protocol.unknown-tool', 'protocol', async () => expectedMcpError('tools/call', { name: 'not_a_public_tool', arguments: {} }, { name: 'not_a_public_tool', code: -32602 }), { severity: 'medium' });
  await runCheck('mcp.protocol.unknown-resource', 'resources', async () => expectedMcpError('resources/read', { uri: 'cognistration://not-published' }, { name: 'cognistration://not-published', code: -32602 }), { severity: 'medium' });
  await runCheck('mcp.protocol.unknown-prompt', 'prompts', async () => expectedMcpError('prompts/get', { name: 'not-a-prompt', arguments: {} }, { name: 'not-a-prompt', code: -32602 }), { severity: 'medium' });
  await runCheck('mcp.protocol.notification', 'protocol', async () => {
    const record = await mcpRaw('notifications/initialized', {}, { methodHeader: false, nameHeader: false });
    assert(record.response.status === 202, `notification returned HTTP ${record.response.status}, expected 202.`);
    assert(!record.text, 'notification unexpectedly returned a response body.');
    return { status: record.response.status };
  });
  await runCheck('mcp.protocol.sse-get', 'protocol', async () => {
    const record = await http(endpoint, { headers: { accept: 'text/event-stream', Origin: requestOrigin } });
    assert(record.response.status === 405, `SSE GET returned HTTP ${record.response.status}, expected 405.`);
    assert(/POST/.test(record.response.headers.get('allow') || ''), 'SSE GET did not advertise POST in Allow.');
    return { status: record.response.status, allow: record.response.headers.get('allow') };
  });
  await runCheck('mcp.protocol.invalid-json', 'protocol', async () => {
    const record = await http(endpoint, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', Origin: requestOrigin, 'MCP-Protocol-Version': MCP_PROTOCOL_VERSION, 'Mcp-Method': 'tools/list' },
      body: '{not-json'
    });
    assert(record.response.status === 400 && record.json?.error?.code === -32700, 'invalid JSON was not rejected as a parse error.');
    return { status: record.response.status, code: record.json.error.code };
  }, { severity: 'medium' });
  await runCheck('mcp.protocol.invalid-jsonrpc', 'protocol', async () => {
    const record = await http(endpoint, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', Origin: requestOrigin },
      body: JSON.stringify({ jsonrpc: '1.0', id: 'invalid', method: 'ping' })
    });
    assert(record.response.status === 400 && record.json?.error?.code === -32600, 'invalid JSON-RPC version was not rejected.');
    return { status: record.response.status, code: record.json.error.code };
  }, { severity: 'medium' });
  await runCheck('mcp.protocol.oversized-body', 'protocol', async () => {
    const record = await http(endpoint, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', Origin: requestOrigin },
      body: JSON.stringify({ jsonrpc: '2.0', id: 'oversized', method: 'ping', padding: 'x'.repeat(65536) })
    });
    assert(record.response.status === 413 && record.json?.error?.code === -32700, 'oversized body was not rejected at the public limit.');
    return { status: record.response.status, code: record.json.error.code };
  }, { severity: 'medium' });
  await runCheck('mcp.protocol.invalid-tool-input', 'validation', async () => {
    const result = await mcp('tools/call', { name: 'get_public_tone', arguments: { id: '', __auditInjected: true } });
    const payload = toolResultFrom(result, 'get_public_tone', { error: true });
    assert(payload.error.code === 'INVALID_INPUT', 'invalid tool input did not return the safe INVALID_INPUT envelope.');
    return payload.error;
  });
}

async function restJson(path, init = {}) {
  const record = await http(path, { ...init, headers: { accept: 'application/json', ...(init.headers || {}) } });
  assert(record.json !== null, `${path} returned non-JSON HTTP ${record.response.status}.`);
  return record;
}

async function auditRestAndDocumentation() {
  if (skipRest) {
    skipCheck('rest.surface', 'rest', '--skip-rest was supplied.');
    return;
  }

  await runCheck('rest.capabilities', 'rest', async () => {
    const record = await restJson('/api/capabilities');
    assert(record.response.ok, `/api/capabilities returned HTTP ${record.response.status}.`);
    assert(record.json.canonicalOrigin === siteOrigin, 'capability manifest canonical origin drifted.');
    assert(stable(record.json.mcp.tools.map((tool) => tool.name)) === stable(MCP_TOOLS.map((tool) => tool.name)), 'capability manifest MCP tools differ from tools/list.');
    assert(stable(record.json.webmcp.tools) === stable(webMcpManifestTools()), 'capability manifest public WebMCP tools drifted.');
    assert(stable(record.json.memberWebmcp.tools) === stable(memberWebMcpManifestTools()), 'capability manifest member WebMCP tools drifted.');
    assert(record.json.skills?.count === 5, 'capability manifest skill count is not five.');
    assertNoSecretLeak(record.json, '/api/capabilities');
    return { mcpTools: record.json.mcp.tools.length, publicWebMcp: record.json.webmcp.tools.length, memberWebMcp: record.json.memberWebmcp.tools.length, skills: record.json.skills.count };
  });

  await runCheck('rest.openapi', 'rest', async () => {
    const record = await restJson('/openapi.json');
    assert(record.response.ok && record.json.openapi === '3.1.0', 'OpenAPI document is missing or not 3.1.0.');
    assert(stable(record.json['x-cognistration']?.publicTools?.map((tool) => tool.name)) === stable(MCP_TOOLS.map((tool) => tool.name)), 'OpenAPI public tool registry drifted.');
    for (const path of ['/api/agent', '/api/agent/intent-guidance', '/api/agent/tone-calibrate', '/api/agent/tone-compare', '/api/agent/session-plan', '/api/agent/session-cue', '/api/agent/session-recipe', '/api/agent/session-score', '/api/packs', '/api/agent/policy', '/api/agent/account', '/api/agent/commerce/tone-pack-checkout', '/api/agent/commerce/tone-pack-delivery', '/api/machine-payments/tone-pack', '/api/ucp/checkout-sessions', '/api/mcp']) {
      assert(record.json.paths?.[path], `OpenAPI is missing ${path}.`);
    }
    const serialized = JSON.stringify(record.json);
    assert(!/(password|cardNumber|cvc|secretKey|apiKey)/i.test(serialized), 'OpenAPI publishes a credential-shaped field.');
    return { openapi: record.json.openapi, paths: Object.keys(record.json.paths).length, publicTools: record.json['x-cognistration'].publicTools.length };
  });

  await runCheck('rest.agent-instructions', 'documentation', async () => {
    const record = await http('/agent-instructions.md', { headers: { accept: 'text/markdown' } });
    assert(record.response.ok && /text\/markdown/.test(record.response.headers.get('content-type') || ''), 'agent instructions are not served as Markdown.');
    for (const tool of MCP_TOOLS) assert(record.text.includes(tool.name), `agent instructions omit ${tool.name}.`);
    assert(record.text.includes('ui://cognistration/machine-generator/v3.html'), 'agent instructions omit the current machine widget URI.');
    assert(!record.text.includes('ui://cognistration/machine-generator/v2.html'), 'agent instructions publish a retired machine widget URI.');
    assert(/(?:credentials are (?:entered and )?submitted (?:by the user )?directly|submits credentials directly)/i.test(record.text), 'agent instructions omit the user-controlled credential boundary.');
    assertNoSecretLeak(record.text, '/agent-instructions.md');
    return { bytes: Buffer.byteLength(record.text), toolsMentioned: MCP_TOOLS.length };
  }, { severity: 'medium' });

  await runCheck('rest.llms', 'documentation', async () => {
    const record = await http('/llms.txt', { headers: { accept: 'text/plain' } });
    assert(record.response.ok && record.text.includes('/api/mcp') && record.text.includes('/docs'), 'llms.txt omits public MCP or docs discovery.');
    assertNoSecretLeak(record.text, '/llms.txt');
    return { bytes: Buffer.byteLength(record.text) };
  }, { severity: 'medium' });

  await runCheck('rest.connect', 'rest', async () => {
    const record = await restJson('/connect');
    assert(record.response.ok && record.json.endpoint === `${httpOrigin}/connect`, 'connect GET does not expose the human-facing MCP alias.');
    const post = await http('/connect', {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json', Origin: requestOrigin, 'MCP-Protocol-Version': MCP_PROTOCOL_VERSION, 'Mcp-Method': 'server/discover' },
      body: JSON.stringify(mcpRequestBody('server/discover', { _meta: modernMeta() }, 'connect-audit'))
    });
    assertJsonRpc(post, 'connect POST server/discover');
    return { service: record.json.service, endpoint: record.json.endpoint, postStatus: post.response.status };
  });

  await runCheck('rest.public-pages', 'rest', async () => {
    for (const path of ['/', '/try', '/docs', '/signup', '/pricing', '/health-warning']) {
      const record = await http(path, { headers: { accept: 'text/html' } });
      assert(record.response.ok, `${path} returned HTTP ${record.response.status}.`);
      assert(record.text.length > 500, `${path} returned an unexpectedly small document.`);
    }
    const tryPage = await http('/try', { headers: { accept: 'text/html' } });
    const normalizedTryPage = tryPage.text.replace(/<!--\s*-->/g, '');
    assert(normalizedTryPage.includes(`${MCP_TOOLS.length} public MCP tools`), '/try does not show the current MCP tool count.');
    assert(normalizedTryPage.includes(`${WEBMCP_TOOL_DEFINITIONS.length} public WebMCP tools`), '/try does not show the current WebMCP tool count.');
    const docsPage = await http('/docs', { headers: { accept: 'text/html' } });
    assert(docsPage.text.includes('tools/list') && docsPage.text.includes('resources/read'), '/docs does not show MCP protocol commands.');
    return { pages: ['/', '/try', '/docs', '/signup', '/pricing', '/health-warning'], mcpTools: MCP_TOOLS.length, publicWebMcp: WEBMCP_TOOL_DEFINITIONS.length };
  });

  await runCheck('rest.ucp-discovery', 'ucp', async () => {
    const [wellKnown, api] = await Promise.all([restJson('/.well-known/ucp'), restJson('/api/ucp')]);
    assert(wellKnown.response.ok && wellKnown.json.ucp?.version, 'well-known UCP profile is missing.');
    assert(api.response.ok && api.json.mcpEndpoint?.endsWith('/api/ucp/mcp'), 'UCP API discovery is missing its MCP endpoint.');
    assert(api.json.profile?.ucp?.capabilities?.['dev.ucp.shopping.checkout'], 'UCP checkout capability is missing.');
    return { version: wellKnown.json.ucp.version, mcpEndpoint: api.json.mcpEndpoint };
  });

  await runCheck('rest.ucp-public-assets', 'ucp', async () => {
    const paths = ['/ucp/handlers/hosted-checkout', '/ucp/schemas/hosted-checkout.json', '/ucp/schemas/stripe-shared-payment-token.json'];
    for (const path of paths) {
      const record = await restJson(path);
      assert(record.response.ok, `${path} returned HTTP ${record.response.status}.`);
      assertNoSecretLeak(record.json, path);
    }
    return { paths };
  });

  const toneId = PUBLIC_TONE_CATALOG[0]?.id;
  const packSlug = PUBLIC_TONE_PACK_CATALOG[0]?.slug || 'full-spectrum-pack';
  await runCheck('rest.agent-safe-fallbacks', 'rest', async () => {
    const cases = [
      { path: '/api/agent/policy?topic=safety', record: await restJson('/api/agent/policy?topic=safety'), check: (json) => json.ok && json.policy?.topic === 'safety' },
      { path: '/api/agent/account', record: await restJson('/api/agent/account'), check: (json) => json.ok && json.signup?.credentialsAcceptedByPublicMcp === false },
      { path: `/api/packs?agent=1&slug=${encodeURIComponent(packSlug)}`, record: await restJson(`/api/packs?agent=1&slug=${encodeURIComponent(packSlug)}`), check: (json) => json.ok && json.pack?.slug === packSlug },
      { path: '/api/packs?agent=1&query=focus&limit=3', record: await restJson('/api/packs?agent=1&query=focus&limit=3'), check: (json) => json.ok && Array.isArray(json.packs) },
      { path: '/api/agent/intent-guidance', record: await restJson('/api/agent/intent-guidance', { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify({ intention: 'I need something better' }) }), check: (json) => json.ok && json.guidance },
      { path: '/api/agent/tone-calibrate', record: await restJson('/api/agent/tone-calibrate', { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify({ feedback: 'too_quiet', targetState: 'theta', carrierHz: 200, beatHz: 6, volume: 72 }) }), check: (json) => json.ok && json.calibration },
      { path: '/api/agent/tone-compare', record: await restJson('/api/agent/tone-compare', { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify({ intention: 'a calm reset before writing', limit: 3 }) }), check: (json) => json.ok && json.comparison },
      { path: '/api/agent/session-plan', record: await restJson('/api/agent/session-plan', { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify({ intention: 'a calm reset before writing', durationMin: 20 }) }), check: (json) => json.ok && json.plan },
      { path: '/api/agent/session-cue', record: await restJson('/api/agent/session-cue', { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify({ intention: 'a calm reset before writing', mode: 'reflect' }) }), check: (json) => json.ok && json.cue },
      { path: '/api/agent/session-recipe', record: await restJson('/api/agent/session-recipe', { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify({ targetState: 'theta', carrierHz: 200, beatHz: 6, volume: 72, durationSec: 120, intentionLabel: 'reflect' }) }), check: (json) => json.ok && json.privacy?.diaryContentIncluded === false },
      { path: '/api/agent/session-score', record: await restJson('/api/agent/session-score', { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify({ direction: 'focus', durationSec: 600 }) }), check: (json) => json.ok && json.score?.status === 'completed' && json.score?.boundaries?.persisted === false && json.score?.boundaries?.rendered === false && json.score?.stages?.reduce((sum, stage) => sum + stage.durationSec, 0) === 600 },
      { path: '/api/agent', record: await restJson('/api/agent', { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify({ intention: 'a calm reset before writing' }) }), check: (json) => json.ok && json.track?.id && ['delta', 'theta', 'alpha', 'beta', 'gamma'].includes(json.track?.state) }
    ];
    for (const item of cases) {
      assert(item.record.response.ok, `${item.path} returned HTTP ${item.record.response.status}.`);
      assert(item.check(item.record.json), `${item.path} returned an unexpected safe response shape.`);
      assertNoSecretLeak(item.record.json, item.path);
    }
    return { routes: cases.length, toneId };
  });

  await runCheck('rest.user-write-boundaries', 'security', async () => {
    const signupOptions = await http('/api/agent/account/signup', { method: 'OPTIONS', headers: { Origin: siteOrigin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
    const feedbackOptions = await http('/api/agent/feedback', { method: 'OPTIONS', headers: { Origin: siteOrigin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
    assert(signupOptions.response.status === 204 && feedbackOptions.response.status === 204, 'signup or feedback preflight failed.');
    assert(signupOptions.response.headers.get('access-control-allow-origin') === siteOrigin && feedbackOptions.response.headers.get('access-control-allow-origin') === siteOrigin, 'signup or feedback preflight did not echo the canonical origin.');
    const signup = await restJson('/api/agent/account/signup', { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify({}) });
    const feedback = await restJson('/api/agent/feedback', { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify({}) });
    assert(signup.response.status === 400 && signup.json.code === 'INVALID_INPUT', 'malformed signup was not rejected without touching credentials.');
    assert(feedback.response.status === 400 && feedback.json.code === 'INVALID_INPUT', 'malformed feedback was not rejected without persistence.');
    assertNoSecretLeak(signup.json, 'signup boundary');
    assertNoSecretLeak(feedback.json, 'feedback boundary');
    return { signupPreflight: signupOptions.response.status, feedbackPreflight: feedbackOptions.response.status, signup: signup.json.code, feedback: feedback.json.code };
  }, { severity: 'critical' });

  await runCheck('rest.checkout-boundaries', 'security', async () => {
    const packCheckout = await restJson('/api/agent/commerce/tone-pack-checkout', { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify({ slug: packSlug, email: 'audit@example.invalid', confirmed: false, idempotencyKey: 'audit-rest-pack-nocharge-01' }) });
    const workshopCheckout = await restJson('/api/agent/commerce/workshop-checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'audit@example.invalid', confirmed: false, idempotencyKey: 'audit-rest-workshop-nocharge-01' }) });
    assert(packCheckout.response.status === 400 && packCheckout.json.code, 'unconfirmed tone-pack checkout did not stop at validation.');
    assert(workshopCheckout.response.status === 400 && workshopCheckout.json.code, 'unconfirmed workshop checkout did not stop at validation.');
    assertNoSecretLeak(packCheckout.json, 'tone-pack checkout boundary');
    assertNoSecretLeak(workshopCheckout.json, 'workshop checkout boundary');
    return { tonePack: packCheckout.json.code, workshop: workshopCheckout.json.code };
  }, { severity: 'critical' });

  await runCheck('rest.mcp-payment-challenges', 'commerce', async () => {
    const optionResult = structured(await mcp('tools/call', { name: 'get_tone_pack_payment_options', arguments: {} }));
    const machineResult = structured(await mcp('tools/call', { name: 'get_machine_payment_options', arguments: {} }));
    const routes = [
      { path: '/api/machine-payments/session', body: {}, enabled: machineResult.status === 'enabled', expectedDisabled: 'MACHINE_PAYMENTS_NOT_ENABLED' },
      { path: '/api/machine-payments/tone', body: { intention: 'a calm reset before writing', targetState: 'theta', carrierHz: 200, beatHz: 6, volume: 72 }, enabled: machineResult.status === 'enabled', expectedDisabled: 'MACHINE_PAYMENTS_NOT_ENABLED' },
      { path: '/api/machine-payments/tone-pack', body: { slug: packSlug, email: 'audit@example.invalid', confirmed: true }, enabled: optionResult.status === 'enabled', expectedDisabled: 'TONE_PACK_PAYMENTS_NOT_ENABLED' }
    ];
    const outcomes = [];
    for (const route of routes) {
      const getRecord = await restJson(route.path);
      const postRecord = await restJson(route.path, { method: 'POST', headers: { 'content-type': 'application/json', Origin: siteOrigin }, body: JSON.stringify(route.body) });
      if (route.enabled) {
        assert(getRecord.response.status === 200, `${route.path} GET returned HTTP ${getRecord.response.status} while enabled.`);
        assert(postRecord.response.status === 402, `${route.path} POST without a provider credential returned HTTP ${postRecord.response.status}, expected 402.`);
        assert(postRecord.json?.error?.code || postRecord.json?.error?.type || postRecord.json?.type, `${route.path} payment challenge is missing an error/challenge body.`);
      } else {
        assert(getRecord.response.status === 503 && getRecord.json.code === route.expectedDisabled, `${route.path} disabled GET did not fail closed.`);
        assert(postRecord.response.status === 503 && postRecord.json.code === route.expectedDisabled, `${route.path} disabled POST did not fail closed.`);
      }
      assertNoSecretLeak(postRecord.json || postRecord.text, route.path);
      outcomes.push({ path: route.path, enabled: route.enabled, get: getRecord.response.status, post: postRecord.response.status });
    }
    return outcomes;
  }, { severity: 'critical' });
}

async function auditUcpTransport() {
  if (skipUcp) {
    skipCheck('ucp.transport', 'ucp', '--skip-ucp was supplied.');
    return;
  }
  const profile = `${siteOrigin}/agent-profile`;
  const withAgent = { meta: { 'ucp-agent': { profile } } };
  const discoverRecord = await mcpUcpRaw('server/discover', withAgent);
  const protectedMode = discoverRecord.response.status === 401;

  await runCheck('ucp.transport.agent-profile', 'ucp-security', async () => {
    if (protectedMode) {
      assert(discoverRecord.json?.error?.code === -32602, 'protected UCP discovery did not return a JSON-RPC security error.');
      return { mode: 'provider-authenticated', status: discoverRecord.response.status };
    }
    assertJsonRpc(discoverRecord, 'UCP server/discover');
    assert(discoverRecord.json.result?.profile?.ucp?.version, 'UCP discovery profile is missing.');
    return { mode: 'agent-profile', status: discoverRecord.response.status, version: discoverRecord.json.result.profile.ucp.version };
  });

  await runCheck('ucp.transport.missing-profile-denied', 'ucp-security', async () => {
    const record = await mcpUcpRaw('server/discover', {});
    assert([400, 401].includes(record.response.status), `UCP request without profile returned HTTP ${record.response.status}.`);
    assert(record.json?.error, 'UCP request without profile did not return an error.');
    return { status: record.response.status, code: record.json.error.code };
  }, { severity: 'critical' });

  if (protectedMode) {
    skipCheck('ucp.transport.tools', 'ucp', 'UCP provider authentication is configured; no credential is available to this read-only audit.');
    return;
  }

  await runCheck('ucp.transport.tools-list', 'ucp', async () => {
    const record = await mcpUcpRaw('tools/list', withAgent);
    const result = assertJsonRpc(record, 'UCP tools/list');
    assert(stable(result.tools) === stable(UCP_MCP_TOOLS), 'UCP tools/list differs from the checked-in UCP contract.');
    return { count: result.tools.length, names: result.tools.map((tool) => tool.name) };
  });
  await runCheck('ucp.transport.unknown-tool', 'ucp-security', async () => {
    const record = await mcpUcpRaw('tools/call', { ...withAgent, name: 'not_a_ucp_tool', arguments: {} });
    assert(record.response.status === 404 && record.json?.error?.code === -32601, 'unknown UCP tool did not fail with method-not-found.');
    return { status: record.response.status, code: record.json.error.code };
  });
  await runCheck('ucp.transport.checkout-write-denied-without-idempotency', 'ucp-security', async () => {
    const record = await mcpUcpRaw('tools/call', { ...withAgent, name: 'create_checkout', arguments: { ...withAgent.meta, checkout: {} } });
    assert(record.response.status === 400 && record.json?.error, 'malformed UCP checkout was not rejected before creation.');
    return { status: record.response.status, code: record.json.error.code };
  }, { severity: 'critical' });
}

async function mcpUcpRaw(method, params = {}) {
  const id = `ucp-audit-${++requestId}`;
  return http(`${httpOrigin}/api/ucp/mcp`, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', Origin: requestOrigin, 'MCP-Protocol-Version': UCP_MCP_PROTOCOL_VERSION, 'UCP-Agent': `profile="${params.meta?.['ucp-agent']?.profile || ''}"` },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params })
  });
}

async function auditBrowser() {
  if (!browserRequested) {
    skipCheck('webmcp.browser-registration', 'webmcp', 'Use --browser with Playwright and Chromium to run the real homepage registration check.');
    return;
  }

  let playwrightModule;
  try {
    playwrightModule = await import(process.env.COGNISTRATION_PLAYWRIGHT_MODULE || 'playwright');
  } catch (error) {
    skipCheck('webmcp.browser-registration', 'webmcp', `Playwright is unavailable: ${redact(error?.message || String(error))}`);
    return;
  }
  const playwright = playwrightModule.chromium ? playwrightModule : playwrightModule.default;
  if (!playwright?.chromium) {
    skipCheck('webmcp.browser-registration', 'webmcp', 'The selected Playwright module does not expose chromium.');
    return;
  }

  let browser;
  try {
    return await runCheck('webmcp.browser-registration', 'webmcp', async () => {
      browser = await playwright.chromium.launch({
        headless: true,
        executablePath: process.env.COGNISTRATION_CHROME_PATH || undefined
      });
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await page.addInitScript(() => {
        const registered = [];
        Object.defineProperty(window, '__cognistrationAuditWebMcpTools', { configurable: true, value: registered });
        Object.defineProperty(document, 'modelContext', {
          configurable: true,
          value: {
            registerTool(tool) {
              registered.push(tool);
              return Promise.resolve();
            }
          }
        });
      });
      await page.goto(new URL('/try', siteOrigin).toString(), { waitUntil: 'domcontentloaded', timeout: timeoutMs });
      await page.waitForFunction((expected) => window.__cognistrationAuditWebMcpTools?.length === expected, WEBMCP_TOOL_DEFINITIONS.length, { timeout: timeoutMs });

      const snapshot = await page.evaluate(() => ({
        names: window.__cognistrationAuditWebMcpTools.map((tool) => tool.name),
        schemas: window.__cognistrationAuditWebMcpTools.map((tool) => tool.inputSchema),
        hasCockpit: document.body.innerText.includes('Agentic Session Score')
      }));
      assert(stable(snapshot.names) === stable(WEBMCP_TOOL_DEFINITIONS.map((tool) => tool.name)), '/try WebMCP names differ from the public contract.');
      assert(snapshot.hasCockpit, '/try score cockpit did not render during the WebMCP check.');
      for (const schema of snapshot.schemas) assert(schema.additionalProperties === false, '/try WebMCP published a non-strict input schema.');

      const execute = async (name, input) => page.evaluate(async ({ toolName, toolInput }) => {
        const tool = window.__cognistrationAuditWebMcpTools.find((candidate) => candidate.name === toolName);
        if (!tool) throw new Error(`WebMCP tool ${toolName} was not registered.`);
        return tool.execute(toolInput);
      }, { toolName: name, toolInput: input });
      const stateBefore = await execute('cognistration_get_session_state', {});
      const exact = await execute('cognistration_set_session_controls', { targetState: 'gamma', carrierHz: 246, beatHz: 18, volume: 64 });
      const stateAfter = await execute('cognistration_get_session_state', {});
      const confirmation = await execute('cognistration_begin_preview', { confirmed: false });
      const guide = await execute('cognistration_open_science_guide', { targetState: 'gamma', carrierHz: 246, beatHz: 6, volume: 64 });
      const composed = await execute('cognistration_compose_session_score', {
        direction: 'focus',
        durationSec: 600,
        sound: {
          entrainmentModes: { binaural: true, monaural: true, isochronic: true },
          background: { type: 'ocean', mixDb: -24 },
          breathGuide: { enabled: true, pattern: 'box', bpm: 4 },
          fades: { inSec: 5, outSec: 8 }
        }
      });
      const selected = await execute('cognistration_select_session_score_stage', { stageId: 'stage-2' });
      const refined = await execute('cognistration_refine_session_score_stage', { stageId: 'stage-2', carrierHz: 222, beatFromHz: 10, beatToHz: 14, volume: 61, soundPatch: { fades: { inSec: 3 }, breathGuide: { enabled: false } } });
      const undone = await execute('cognistration_undo_session_score', { steps: 1 });
      const scoreConfirmation = await execute('cognistration_preview_session_score', { confirmed: false, stageId: 'stage-2' });
      assert(stateBefore?.state || stateBefore?.status === 'completed', 'WebMCP state read returned no state.');
      assert(exact?.status === 'completed' && stateAfter?.state?.carrierHz === 246, 'WebMCP exact controls did not update the visible state.');
      assert(confirmation?.status === 'needs_input' && confirmation.error?.code === 'CONFIRMATION_REQUIRED', 'WebMCP audio confirmation boundary failed.');
      assert(guide?.status === 'completed', 'WebMCP science guide action failed.');
      assert(composed?.status === 'completed' && composed.stages?.length === 3, 'WebMCP score composition failed.');
      assert(composed?.sound?.entrainmentModes?.isochronic === true && composed?.sound?.breathGuide?.pattern === 'box', 'WebMCP full-spectrum options did not route.');
      assert(selected?.selectedStageId === 'stage-2', 'WebMCP score selection failed.');
      assert(refined?.stages?.find((stage) => stage.id === 'stage-2')?.carrierHz === 222, 'WebMCP score refinement failed.');
      assert(refined?.sound?.fades?.inSec === 3 && refined?.sound?.breathGuide?.enabled === false, 'WebMCP sound-profile refinement failed.');
      assert(undone?.stages?.find((stage) => stage.id === 'stage-2')?.carrierHz !== 222, 'WebMCP score undo failed.');
      assert(scoreConfirmation?.status === 'needs_input' && scoreConfirmation.error?.code === 'CONFIRMATION_REQUIRED', 'WebMCP score confirmation boundary failed.');
      return { registered: snapshot.names.length, changedCarrier: stateAfter.state.carrierHz, confirmation: confirmation.error.code, scoreConfirmation: scoreConfirmation.error.code, guide: guide.status };
    });
  } finally {
    if (browser) await browser.close();
  }
}

async function main() {
  await auditLocalContracts();
  await auditDiscovery();
  await auditResources();
  await auditTools();
  await auditProtocolFailures();
  await auditRestAndDocumentation();
  await auditUcpTransport();
  await runCheck('webmcp.contract-manifest', 'webmcp', () => {
    const manifest = capabilityManifest(siteOrigin);
    assert(stable(manifest.webmcp.tools) === stable(webMcpManifestTools()), 'local manifest public WebMCP tools drifted.');
    assert(stable(manifest.memberWebmcp.tools) === stable(memberWebMcpManifestTools()), 'local manifest member WebMCP tools drifted.');
    return { publicTools: manifest.webmcp.tools.length, memberTools: manifest.memberWebmcp.tools.length };
  });
  await auditBrowser();

  const counts = checks.reduce((accumulator, check) => {
    accumulator[check.status] = (accumulator[check.status] || 0) + 1;
    return accumulator;
  }, {});
  const failures = checks.filter((check) => check.status === 'fail');
  const report = {
    schemaVersion: 'cognistration-mcp-audit-v1',
    auditId: `mcp-audit-${new Date().toISOString().replace(/[-:.TZ]/g, '')}`,
    generatedAt: new Date().toISOString(),
    target: { siteOrigin, endpoint, requestOrigin, server: MCP_SERVER_NAME, serverVersion: MCP_SERVER_VERSION, protocol: MCP_PROTOCOL_VERSION },
    mode: { browserRequested, restSkipped: skipRest, ucpSkipped: skipUcp, paceMs, retry429Ms },
    summary: { status: failures.length ? 'fail' : 'pass', checks: checks.length, ...counts, httpRequests: requestLog.length, serverWritesAttempted: false, controlCommandsExercised: true, confirmationGatesExercised: true, paymentChallengesExercised: true, credentialsSubmitted: false, paymentsSubmitted: false, feedbackSubmitted: false, audioStarted: false },
    coverage: {
      mcpToolsPublished: MCP_TOOLS.length,
      mcpToolsExercised: checks.filter((check) => check.id.startsWith('mcp.tool.call.')).length,
      resourcesPublished: MCP_RESOURCES.length,
      resourceReadsAttempted: checks.filter((check) => check.id.startsWith('mcp.resource.read.')).length,
      skillsPublished: 5,
      protocolFailureCases: checks.filter((check) => check.category === 'protocol').length,
      publicWebMcpToolsPublished: WEBMCP_TOOL_DEFINITIONS.length,
      memberWebMcpToolsPublished: MEMBER_WEBMCP_TOOL_DEFINITIONS.length,
      ucpToolsPublished: UCP_MCP_TOOLS.length
    },
    checks,
    failures,
    requestLog: requestLog.slice(-200)
  };
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify({
    status: report.summary.status,
    target: report.target,
    summary: report.summary,
    report: reportPath,
    failures: failures.map((failure) => ({ id: failure.id, category: failure.category, severity: failure.severity, error: failure.error }))
  }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch(async (error) => {
  const fatal = { status: 'fatal', error: redact(error?.stack || error?.message || String(error)), report: reportPath };
  try {
    await mkdir(dirname(reportPath), { recursive: true });
    await writeFile(reportPath, `${JSON.stringify(fatal, null, 2)}\n`, 'utf8');
  } catch {
    // Keep the original fatal error visible even if report creation fails.
  }
  console.error(JSON.stringify(fatal, null, 2));
  process.exitCode = 1;
});
