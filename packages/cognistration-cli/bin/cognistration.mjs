#!/usr/bin/env node

const baseUrl = (process.env.COGNISTRATION_URL || 'https://cognistration.com').replace(/\/$/, '');
const command = process.argv[2] || 'capabilities';
const routes = {
  capabilities: '/api/capabilities',
  tools: '/api/mcp',
  docs: '/docs.md',
  sandbox: '/api/sandbox'
};

if (!routes[command]) {
  console.error(`Unknown command: ${command}. Use capabilities, tools, docs, or sandbox.`);
  process.exitCode = 2;
} else {
  const response = command === 'tools'
    ? await fetch(`${baseUrl}${routes[command]}`, { method: 'POST', headers: { 'content-type': 'application/json', 'MCP-Protocol-Version': '2026-07-28', 'Mcp-Method': 'tools/list' }, body: JSON.stringify({ jsonrpc: '2.0', id: 'cli-1', method: 'tools/list', params: {} }) })
    : await fetch(`${baseUrl}${routes[command]}`);
  console.log(JSON.stringify(await response.json(), null, 2));
  if (!response.ok) process.exitCode = 1;
}
