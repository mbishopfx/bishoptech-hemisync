#!/usr/bin/env node

const endpoint = process.env.COGNISTRATION_MCP_ENDPOINT || process.argv[2] || 'https://cognistration.com/api/mcp';
const requestOrigin = process.env.COGNISTRATION_MCP_ORIGIN || 'https://cognistration.com';
const protocolVersion = '2026-07-28';
let requestId = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requestMeta() {
  return { 'io.modelcontextprotocol/protocolVersion': protocolVersion };
}

async function rpc(method, params = {}, name = null) {
  const headers = {
    accept: 'application/json',
    'content-type': 'application/json',
    Origin: requestOrigin,
    'MCP-Protocol-Version': protocolVersion,
    'Mcp-Method': method
  };
  if (name) headers['Mcp-Name'] = name;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: `live-${++requestId}`,
      method,
      params: { ...params, _meta: requestMeta() }
    })
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`${method} returned non-JSON HTTP ${response.status}.`);
  }
  assert(response.ok, `${method} returned HTTP ${response.status}: ${body.error?.message || 'request failed'}`);
  assert(!body.error, `${method} returned MCP error ${body.error?.code}: ${body.error?.message}`);
  return body.result;
}

function structured(result) {
  return result?.structuredContent || result;
}

async function main() {
  const discovery = await rpc('server/discover');
  assert(discovery.capabilities?.extensions?.['io.modelcontextprotocol/skills'], 'skills extension is not advertised');

  const toolsResult = await rpc('tools/list');
  const tools = toolsResult.tools || [];
  assert(tools.length >= 20, `expected the public MCP catalog, received ${tools.length} tools`);
  assert(tools.some((tool) => tool.name === 'prepare_session_recipe'), 'prepare_session_recipe is missing');
  assert(tools.some((tool) => tool.name === 'get_machine_payment_options'), 'get_machine_payment_options is missing');

  const skillsResult = await rpc('skills/list');
  const skills = skillsResult.skills || [];
  assert(skills.length === 4, `expected four Cognistration skills, received ${skills.length}`);
  const firstSkill = skills[0];
  const skillResult = await rpc('skills/get', { uri: firstSkill.uri });
  assert(skillResult.skill?.frontmatter?.name, 'skills/get did not return frontmatter');

  const interactionResult = await rpc('resources/read', { uri: 'cognistration://interaction-patterns' }, 'cognistration://interaction-patterns');
  const interactionText = interactionResult.contents?.[0]?.text || '{}';
  const interaction = JSON.parse(interactionText);
  assert(interaction.safetyRouting?.route === '/health-warning', 'safety routing resource is missing');

  const clarifyResult = structured(await rpc('tools/call', {
    name: 'clarify_intention',
    arguments: { intention: 'I need something better' }
  }, 'clarify_intention'));
  assert(clarifyResult.choices?.length === 3, 'clarify_intention did not return three bounded choices');

  const recipeResult = structured(await rpc('tools/call', {
    name: 'prepare_session_recipe',
    arguments: { targetState: 'gamma', carrierHz: 246, beatHz: 6, volume: 72, durationSec: 120, intentionLabel: 'focus' }
  }, 'prepare_session_recipe'));
  assert(recipeResult.privacy?.diaryContentIncluded === false, 'recipe privacy boundary is missing');
  assert(recipeResult.recipe?.recipeVersion === 'cognistration-session-recipe-v1', 'recipe version is unexpected');

  const paymentResult = structured(await rpc('tools/call', {
    name: 'get_machine_payment_options',
    arguments: {}
  }, 'get_machine_payment_options'));
  assert(paymentResult.status === 'enabled', 'machine-payment provider is not enabled');
  assert(paymentResult.amountCents === 50, 'machine-payment amount is not 50 cents');
  assert(paymentResult.toneSession?.endpoint, 'paid tone-session endpoint is missing');

  console.log(JSON.stringify({
    endpoint,
    protocol: protocolVersion,
    serverDiscover: 'ok',
    tools: tools.length,
    skills: skills.map((skill) => skill.frontmatter.name),
    fetchedSkill: skillResult.skill.frontmatter.name,
    safetyRoute: interaction.safetyRouting.route,
    clarificationChoices: clarifyResult.choices.length,
    recipeVersion: recipeResult.recipe.recipeVersion,
    machinePayment: { status: paymentResult.status, amountCents: paymentResult.amountCents, toneEndpoint: paymentResult.toneSession.endpoint }
  }, null, 2));
}

main().catch((error) => {
  console.error(`MCP live test failed: ${error.message}`);
  process.exitCode = 1;
});
