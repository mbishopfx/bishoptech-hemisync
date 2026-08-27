'use client';

import { useEffect, useRef, useState } from 'react';
import { getAccessToken } from '@/lib/frontend/api';
import { toBackendUrl } from '@/lib/frontend/backend-url';
import { MEMBER_WEBMCP_TOOL_DEFINITIONS, MEMBER_WEBMCP_CONTRACT_ID, MEMBER_WEBMCP_CONTRACT_VERSION } from '@/lib/agentic/webmcp-contract';

function browserCorrelationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `member-browser-${Date.now()}`;
}

function safeToolError(response, data) {
  return {
    capabilityId: data?.capabilityId || MEMBER_WEBMCP_CONTRACT_ID,
    version: data?.version || MEMBER_WEBMCP_CONTRACT_VERSION,
    correlationId: data?.correlationId || browserCorrelationId(),
    status: data?.status || 'failed',
    error: data?.error || {
      code: response.status === 401 ? 'AUTH_REQUIRED' : response.status === 403 ? 'SUBSCRIPTION_REQUIRED' : 'MEMBER_REQUEST_FAILED',
      safeMessage: response.status === 401 ? 'Sign in to use your private workspace.' : response.status === 403 ? 'An active membership is required for private sessions.' : 'The workspace request could not be completed.',
      retryable: response.status >= 500
    }
  };
}

async function memberRequest(path, { method = 'GET', body } = {}) {
  const token = await getAccessToken();
  if (!token) {
    return {
      capabilityId: MEMBER_WEBMCP_CONTRACT_ID,
      version: MEMBER_WEBMCP_CONTRACT_VERSION,
      correlationId: browserCorrelationId(),
      status: 'needs_input',
      error: { code: 'AUTH_REQUIRED', safeMessage: 'Sign in to use your private workspace.', retryable: false }
    };
  }

  const response = await fetch(toBackendUrl(path), {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store'
  });
  const data = await response.json().catch(() => ({}));
  return response.ok ? data : safeToolError(response, data);
}

async function startRender(renderId) {
  const token = await getAccessToken();
  if (!token) return null;
  const response = await fetch(toBackendUrl(`/api/studio/renders/${renderId}/run`), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return safeToolError(response, data);

  const downloadsResponse = await fetch(toBackendUrl(`/api/studio/renders/${renderId}/downloads`), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  const downloads = await downloadsResponse.json().catch(() => ({}));
  return downloadsResponse.ok
    ? { ...data, downloads: downloads.downloads || {} }
    : { ...data, downloads: null, deliveryState: 'rendered_but_download_links_unavailable' };
}

function buildTool(definition, execute) {
  return {
    name: definition.name,
    description: definition.description,
    inputSchema: definition.inputSchema,
    annotations: definition.annotations,
    execute
  };
}

export function MemberWebMcpBridge() {
  const controllerRef = useRef(null);
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const modelContext = typeof document !== 'undefined'
      ? document.modelContext || (typeof navigator !== 'undefined' ? navigator.modelContext : null)
      : null;

    if (!modelContext?.registerTool) {
      setStatus('fallback');
      return undefined;
    }

    const definitions = Object.fromEntries(MEMBER_WEBMCP_TOOL_DEFINITIONS.map((definition) => [definition.name, definition]));
    const tools = [
      buildTool(definitions.cognistration_member_get_workspace, () => memberRequest('/api/member/workspace')),
      buildTool(definitions.cognistration_member_prepare_session, (input) => memberRequest('/api/member/plan', { method: 'POST', body: input })),
      buildTool(definitions.cognistration_member_clarify_intention, (input) => memberRequest('/api/agent/intent-guidance', { method: 'POST', body: input })),
      buildTool(definitions.cognistration_member_calibrate_tone, (input) => memberRequest('/api/agent/tone-calibrate', { method: 'POST', body: input })),
      buildTool(definitions.cognistration_member_compare_tone_directions, (input) => memberRequest('/api/agent/tone-compare', { method: 'POST', body: input })),
      buildTool(definitions.cognistration_member_plan_listening_session, (input) => memberRequest('/api/agent/session-plan', { method: 'POST', body: input })),
      buildTool(definitions.cognistration_member_get_session_cue, (input) => memberRequest('/api/agent/session-cue', { method: 'POST', body: input || {} })),
      buildTool(definitions.cognistration_member_prepare_session_recipe, (input) => memberRequest('/api/agent/session-recipe', { method: 'POST', body: input || {} })),
      buildTool(definitions.cognistration_member_generate_tone, async (input = {}) => {
        if (input.confirmed !== true) {
          return {
            capabilityId: MEMBER_WEBMCP_CONTRACT_ID,
            version: MEMBER_WEBMCP_CONTRACT_VERSION,
            correlationId: browserCorrelationId(),
            status: 'needs_input',
            error: { code: 'CONFIRMATION_REQUIRED', safeMessage: 'Please confirm before creating and rendering a private session.', retryable: false }
          };
        }
        const idempotencyKey = input.idempotencyKey || browserCorrelationId();
        const created = await memberRequest('/api/member/generate', { method: 'POST', body: { ...input, idempotencyKey } });
        if (created.status !== 'completed' || !created.render?.id || input.startRender === false) return created;
        const rendered = await startRender(created.render.id);
        return rendered?.error ? { ...created, render: { ...created.render, status: 'failed' }, renderError: rendered.error } : { ...created, delivery: rendered };
      }),
      buildTool(definitions.cognistration_member_start_render, async (input = {}) => {
        if (input.confirmed !== true) {
          return {
            capabilityId: MEMBER_WEBMCP_CONTRACT_ID,
            version: MEMBER_WEBMCP_CONTRACT_VERSION,
            correlationId: browserCorrelationId(),
            status: 'needs_input',
            error: { code: 'CONFIRMATION_REQUIRED', safeMessage: 'Please confirm before starting audio generation.', retryable: false }
          };
        }
        const rendered = await startRender(input.renderId);
        return rendered?.error ? rendered : { capabilityId: MEMBER_WEBMCP_CONTRACT_ID, version: MEMBER_WEBMCP_CONTRACT_VERSION, correlationId: browserCorrelationId(), status: 'completed', renderId: input.renderId, delivery: rendered };
      }),
      buildTool(definitions.cognistration_member_get_render, async (input = {}) => {
        const result = await memberRequest(`/api/studio/renders/${encodeURIComponent(input.renderId)}`);
        if (result.status !== 'completed' || result.render?.status !== 'completed') return result;
        const downloads = await memberRequest(`/api/studio/renders/${encodeURIComponent(input.renderId)}/downloads`);
        return { ...result, downloads: downloads.downloads || null };
      })
    ];

    let cancelled = false;
    Promise.all(tools.map((tool) => modelContext.registerTool(tool)))
      .then((controllers) => {
        if (cancelled) return;
        controllerRef.current = controllers;
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      const controllers = controllerRef.current || [];
      controllers.forEach((controller) => {
        try { controller?.abort?.(); } catch {}
      });
      controllerRef.current = null;
    };
  }, []);

  return (
    <div data-testid="member-webmcp-bridge" data-member-webmcp-status={status} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/45">
      {status === 'ready' ? 'Workspace controls are available in this browser.' : 'Workspace controls are available when supported.'}
    </div>
  );
}
