import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
  agentSkillsIndex,
  apiCatalogLinkset,
  ardManifest,
  authorizationServerMetadata,
  discoveryLinks,
  mcpCompatibilityManifest,
  mcpServerCard,
  pageMarkdown,
  publicAgentCard
} from '../lib/agentic/discovery-contract.js';
import { MCP_TOOLS } from '../lib/agentic/mcp-contract.js';
import { DOCS_MCP_RESOURCES, DOCS_MCP_TOOLS } from '../lib/agentic/docs-mcp-contract.js';
import { publicOpenApiDocument } from '../lib/agentic/openapi-contract.js';
import { searchPublicTonePacksPage } from '../lib/agentic/pack-capability.js';
import { GET as getRobotsAgentPolicy } from '../app/robots-agent-policy/route.js';
import { GET as getMissingApiRoute } from '../app/api/[...path]/route.js';

test('discovery manifests expose complete machine-readable entry points', () => {
  const links = discoveryLinks('https://example.test');
  const ard = ardManifest('https://example.test');
  assert.equal(ard.specVersion, '1.0');
  assert.equal(ard.host.identifier, 'cognistration.com');
  assert.equal(ard.entries.length, 4);
  for (const entry of ard.entries) {
    assert.ok(entry.identifier);
    assert.ok(entry.displayName);
    assert.ok(entry.type);
    assert.ok(entry.url || entry.data);
  }

  const catalog = apiCatalogLinkset('https://example.test');
  assert.equal(catalog.linkset[0].anchor, links.apiCatalog);
  assert.ok(catalog.linkset[0].item.some((item) => item.href === links.openapi));
  assert.ok(catalog.linkset[0].item.some((item) => item.href === links.mcpServerCard));
  assert.ok(catalog.linkset[0].item.some((item) => item.href === links.docsMcp));

  const card = publicAgentCard('https://example.test');
  assert.equal(card.supportedInterfaces[0].url, links.a2a);
  assert.ok(card.securitySchemes.bearerAuth);
  assert.deepEqual(card.securityRequirements, []);

  const skills = agentSkillsIndex('https://example.test');
  assert.equal(skills.$schema, 'https://schemas.agentskills.io/discovery/0.2.0/schema.json');
  assert.equal(skills.skills.length, 5);
  assert.ok(skills.skills.every((skill) => skill.source.startsWith('https://example.test/skills/')));
  assert.ok(skills.skills.every((skill) => skill.type === 'skill-md' && skill.url.includes('/.well-known/agent-skills/') && /^sha256:[0-9a-f]{64}$/.test(skill.digest)));

  const serverCard = mcpServerCard('https://example.test');
  assert.equal(serverCard.$schema, 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json');
  assert.equal(serverCard.name, 'com.cognistration/cognistration-agentic-platform');
  assert.equal(serverCard.remotes[0].type, 'streamable-http');
  assert.equal(serverCard.remotes[0].url, links.mcp);
  assert.ok(!('tools' in serverCard));

  const compatibilityManifest = mcpCompatibilityManifest('https://example.test');
  assert.equal(compatibilityManifest.serverUrl, links.mcp);
  assert.equal(compatibilityManifest.protocolVersion, '2025-11-25');
  assert.equal(compatibilityManifest.currentProtocolVersion, '2026-07-28');
  assert.equal(compatibilityManifest.tools.length, MCP_TOOLS.length);
  assert.equal(compatibilityManifest.resources.length, 17);
  assert.equal(compatibilityManifest.prompts.length, 1);
  assert.ok(compatibilityManifest.tools.every((tool) => tool.description.length >= 20 && tool.inputSchema?.type === 'object'));
});

test('public MCP descriptions are declarative and annotated for untrusted output', () => {
  const instructionPattern = /\bUse this (?:when|after|once)\b/i;
  for (const tool of MCP_TOOLS) {
    assert.ok(tool.description.length >= 20, `${tool.name} needs a useful description`);
    assert.doesNotMatch(tool.description, instructionPattern, `${tool.name} has instruction-shaped description text`);
    assert.equal(typeof tool.annotations?.readOnlyHint, 'boolean', `${tool.name} lacks readOnlyHint`);
    assert.equal(typeof tool.annotations?.destructiveHint, 'boolean', `${tool.name} lacks destructiveHint`);
  }
  const signup = MCP_TOOLS.find((tool) => tool.name === 'open_account_signup');
  assert.equal(signup.annotations.untrustedContentHint, true);
  assert.ok(DOCS_MCP_TOOLS.every((tool) => tool.annotations.untrustedContentHint === true));
  assert.equal(DOCS_MCP_RESOURCES.length, 6);
});

test('markdown, auth metadata, OpenAPI, and pagination remain honest and linked', () => {
  const docs = pageMarkdown('/docs', 'https://example.test');
  assert.match(docs, /^---\n/);
  assert.match(docs, /https:\/\/example\.test\/\.well-known\/agent-card\.json/);
  assert.match(docs, /api\/sandbox/);
  assert.match(docs, /opaque cursor/);

  const auth = authorizationServerMetadata('https://example.test');
  assert.equal(auth.authorization_server_status, 'discovery_only');
  assert.deepEqual(auth.grant_types_supported, []);

  const document = publicOpenApiDocument('https://example.test');
  for (const path of ['/ask', '/a2a', '/api/batch', '/api/docs-mcp', '/api/jobs', '/api/sandbox']) assert.ok(document.paths[path]);
  assert.ok(document.components.securitySchemes.bearerAuth);
  assert.ok(document.paths['/api/packs'].get.parameters.some((parameter) => parameter.name === 'cursor'));

  const first = searchPublicTonePacksPage({ query: '', limit: 1 });
  if (first.nextCursor) {
    const second = searchPublicTonePacksPage({ query: '', limit: 1, cursor: first.nextCursor });
    assert.notEqual(second.packs[0]?.slug, first.packs[0]?.slug);
  }
});

test('developer manifests and no-write testing surfaces are present', async () => {
  for (const path of [
    'AGENTS.md',
    '.cursorrules',
    'plugin.json',
    'mcp.json',
    'app/robots-agent-policy/route.js',
    'packages/cognistration-sdk/package.json',
    'packages/python/cognistration/pyproject.toml',
    'packages/go/cognistration/go.mod',
    'packages/ruby/cognistration/cognistration.gemspec',
    'app/api/sandbox/route.js',
    'app/api/jobs/route.js'
  ]) assert.ok((await readFile(new URL(`../${path}`, import.meta.url), 'utf8')).length > 0, path);
  const robotsSource = await readFile(new URL('../app/robots-agent-policy/route.js', import.meta.url), 'utf8');
  assert.match(robotsSource, /Content-Signal: search=yes, ai-train=no/);
  const robots = await getRobotsAgentPolicy();
  const robotsBody = await robots.text();
  assert.match(robotsBody, /Content-Signal: search=yes, ai-train=no/);
  assert.match(robotsBody, /schemamap: https:\/\/cognistration\.com\/\.well-known\/schemamap\.xml/);
  const mcpManifestRoute = await readFile(new URL('../app/.well-known/mcp/manifest.json/route.js', import.meta.url), 'utf8');
  assert.match(mcpManifestRoute, /handleMcpPost/);
  assert.match(mcpManifestRoute, /export function POST/);
});

test('unknown API routes return machine-readable JSON errors', async () => {
  const response = getMissingApiRoute();
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.equal(body.error.code, 'API_ROUTE_NOT_FOUND');
  assert.equal(body.error.retryable, false);
  assert.match(body.error.resolution, /openapi/i);
});
