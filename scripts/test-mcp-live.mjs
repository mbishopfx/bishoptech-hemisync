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
  assert(tools.some((tool) => tool.name === 'get_tone_pack_payment_options'), 'get_tone_pack_payment_options is missing');
  assert(tools.some((tool) => tool.name === 'open_science_guide'), 'open_science_guide is missing');
  assert(tools.some((tool) => tool.name === 'get_ios_app_offer'), 'get_ios_app_offer is missing');
  assert(tools.some((tool) => tool.name === 'open_phone_download_options'), 'open_phone_download_options is missing');
  assert(tools.some((tool) => tool.name === 'open_tone_pack_checkout'), 'open_tone_pack_checkout is missing');
  assert(tools.some((tool) => tool.name === 'open_account_signup'), 'open_account_signup is missing');
  assert(tools.some((tool) => tool.name === 'open_feedback'), 'open_feedback is missing');

  const skillsResult = await rpc('skills/list');
  const skills = skillsResult.skills || [];
  assert(skills.length === 5, `expected five Cognistration skills, received ${skills.length}`);
  const firstSkill = skills[0];
  const skillResult = await rpc('skills/get', { uri: firstSkill.uri });
  assert(skillResult.skill?.frontmatter?.name, 'skills/get did not return frontmatter');

  const interactionResult = await rpc('resources/read', { uri: 'cognistration://interaction-patterns' }, 'cognistration://interaction-patterns');
  const interactionText = interactionResult.contents?.[0]?.text || '{}';
  const interaction = JSON.parse(interactionText);
  assert(interaction.safetyRouting?.route === '/health-warning', 'safety routing resource is missing');

  const machineWidgetResult = await rpc('resources/read', { uri: 'ui://cognistration/machine-generator/v1.html' }, 'ui://cognistration/machine-generator/v1.html');
  const machineWidget = machineWidgetResult.contents?.[0];
  assert(machineWidget?.mimeType === 'text/html;profile=mcp-app', 'machine widget MIME type is unexpected');
  assert(/class="frequency-stage"/.test(machineWidget.text || ''), 'machine widget frequency-wave stage is missing');
  assert(/getEntrainmentPath/.test(machineWidget.text || ''), 'machine widget entrainment path renderer is missing');
  assert(!/repeating-linear-gradient/.test(machineWidget.text || ''), 'machine widget still contains the old signal-bar visual');

  const scienceWidgetResult = await rpc('resources/read', { uri: 'ui://cognistration/science-guide/v2.html' }, 'ui://cognistration/science-guide/v2.html');
  const scienceWidget = scienceWidgetResult.contents?.[0];
  assert(scienceWidget?.mimeType === 'text/html;profile=mcp-app', 'science widget MIME type is unexpected');
  assert(/vgpu\.sh\/examples\/fft-ocean-surface/.test(scienceWidget.text || ''), 'science widget ocean visual reference is missing');
  assert(/id="ocean-canvas"/.test(scienceWidget.text || ''), 'science widget animated ocean canvas is missing');
  assert(/science-guide-ocean\.js/.test(scienceWidget.text || ''), 'science widget vGPU module is missing');
  assert(/vgpu@0\.3\.1/.test(scienceWidget.text || ''), 'science widget vGPU version marker is missing');
  assert(!/getContext\(['"]2d['"]\)/.test(scienceWidget.text || ''), 'science widget must not use the retired 2D renderer');
  assert(!/<iframe/i.test(scienceWidget.text || ''), 'science widget must not embed the visual reference page');
  assert(/Download PDF/.test(scienceWidget.text || ''), 'science widget PDF download action is missing');
  assert(/api\/science-guide\/pdf/.test(scienceWidget.text || ''), 'science widget PDF export route is missing');
  assert(/cognistration:ocean-profile/.test(scienceWidget.text || ''), 'science widget ocean run handoff is missing');
  assert(/ArrowRight/.test(scienceWidget.text || ''), 'science widget keyboard navigation is missing');
  assert(/openExternal/.test(scienceWidget.text || ''), 'science widget host download bridge is missing');
  assert(!/ocean-telemetry/.test(scienceWidget.text || ''), 'science widget still contains the retired telemetry badge');
  assert(scienceWidget._meta?.ui?.prefersBorder === false, 'science widget must not request a host-added hard border');
  assert(!/border: 1px solid rgba\(255, 255, 255/.test(scienceWidget.text || ''), 'science widget contains a hard white UI border');

  const iosWidgetResult = await rpc('resources/read', { uri: 'ui://cognistration/ios-app/v1.html' }, 'ui://cognistration/ios-app/v1.html');
  const iosWidget = iosWidgetResult.contents?.[0];
  assert(iosWidget?.mimeType === 'text/html;profile=mcp-app', 'iPhone app widget MIME type is unexpected');
  assert(/slide1-tune-your-brain-waves\.png/.test(iosWidget.text || ''), 'iPhone app widget screenshots are missing');
  assert(/Download now/.test(iosWidget.text || ''), 'iPhone app widget Download Now CTA is missing');
  assert(/openExternal/.test(iosWidget.text || ''), 'iPhone app widget host link bridge is missing');
  assert(iosWidget._meta?.ui?.prefersBorder === false, 'iPhone app widget must not request a host-added hard border');
  assert(!/border: 1px solid rgba\(255, 255, 255/.test(iosWidget.text || ''), 'iPhone app widget contains a hard white UI border');

  const phoneWidgetResult = await rpc('resources/read', { uri: 'ui://cognistration/phone-download/v1.html' }, 'ui://cognistration/phone-download/v1.html');
  const phoneWidget = phoneWidgetResult.contents?.[0];
  assert(phoneWidget?.mimeType === 'text/html;profile=mcp-app', 'phone download widget MIME type is unexpected');
  assert(/\$0\.50/.test(phoneWidget.text || ''), 'phone download widget fixed preview price is missing');
  assert(/\$2\.99/.test(phoneWidget.text || ''), 'phone download widget iPhone price is missing');
  assert(/sendFollowUpMessage/.test(phoneWidget.text || ''), 'phone download widget agent handoff is missing');
  assert(/Payment-Authorization/.test(phoneWidget.text || ''), 'phone download widget payment boundary is missing');
  assert(phoneWidget._meta?.ui?.prefersBorder === false, 'phone download widget must not request a host-added hard border');
  assert(!/border: 1px solid rgba\(255, 255, 255/.test(phoneWidget.text || ''), 'phone download widget contains a hard white UI border');

  const tonePackWidgetResult = await rpc('resources/read', { uri: 'ui://cognistration/tone-pack-checkout/v1.html' }, 'ui://cognistration/tone-pack-checkout/v1.html');
  const tonePackWidget = tonePackWidgetResult.contents?.[0];
  assert(tonePackWidget?.mimeType === 'text/html;profile=mcp-app', 'tone-pack widget MIME type is unexpected');
  assert(/Delivery email/.test(tonePackWidget.text || ''), 'tone-pack widget email field is missing');
  assert(/\$5\.99/.test(tonePackWidget.text || ''), 'tone-pack widget fixed price is missing');
  assert(/create_tone_pack_checkout/.test(tonePackWidget.text || ''), 'tone-pack widget checkout action is missing');
  assert(/get_tone_pack_delivery/.test(tonePackWidget.text || ''), 'tone-pack widget delivery action is missing');
  assert(/Download pack/.test(tonePackWidget.text || ''), 'tone-pack widget download action is missing');
  assert(tonePackWidget._meta?.ui?.prefersBorder === false, 'tone-pack widget must not request a host-added hard border');
  assert(!/border: 1px solid rgba\(255, 255, 255/.test(tonePackWidget.text || ''), 'tone-pack widget contains a hard white UI border');

  const oceanModuleResponse = await fetch(new URL('/vgpu-ocean/science-guide-ocean.js', requestOrigin));
  const oceanModule = await oceanModuleResponse.text();
  assert(oceanModuleResponse.ok, `science ocean module returned HTTP ${oceanModuleResponse.status}`);
  assert(/navigator\.gpu/.test(oceanModule), 'science ocean module does not request WebGPU');
  assert(/frameLoop/.test(oceanModule), 'science ocean module does not animate through vGPU');
  assert(/seed/.test(oceanModule), 'science ocean module is missing seeded variation');
  assert(!/ocean-telemetry/.test(oceanModule), 'science ocean module still targets the retired telemetry badge');

  const pdfExportResponse = await fetch(new URL('/api/science-guide/pdf?targetState=gamma&carrierHz=246&beatHz=6&volume=64&oceanSeed=101', requestOrigin), {
    headers: { Origin: 'null' }
  });
  assert(pdfExportResponse.ok, `science guide GET PDF export returned HTTP ${pdfExportResponse.status}`);
  assert((pdfExportResponse.headers.get('content-type') || '').includes('application/pdf'), 'science guide GET PDF export MIME type is unexpected');
  assert(/attachment; filename="cognistration-science-guide-/.test(pdfExportResponse.headers.get('content-disposition') || ''), 'science guide GET PDF export is missing attachment disposition');
  const pdfBytes = new Uint8Array(await pdfExportResponse.arrayBuffer());
  assert(new TextDecoder().decode(pdfBytes.slice(0, 8)) === '%PDF-1.4', 'science guide GET PDF export is not a valid PDF');
  assert(pdfBytes.length > 1000, 'science guide GET PDF export is unexpectedly empty');

  const accountWidgetResult = await rpc('resources/read', { uri: 'ui://cognistration/account-signup/v1.html' }, 'ui://cognistration/account-signup/v1.html');
  const accountWidget = accountWidgetResult.contents?.[0];
  assert(accountWidget?.mimeType === 'text/html;profile=mcp-app', 'account widget MIME type is unexpected');
  assert(/id="account-form"/.test(accountWidget.text || ''), 'account widget form is missing');
  assert(/api\/agent\/account\/signup/.test(accountWidget.text || ''), 'account widget first-party submit route is missing');
  assert(!/window\.openai\.callTool/.test(accountWidget.text || ''), 'account widget must not send credentials through MCP');

  const feedbackWidgetResult = await rpc('resources/read', { uri: 'ui://cognistration/feedback/v1.html' }, 'ui://cognistration/feedback/v1.html');
  const feedbackWidget = feedbackWidgetResult.contents?.[0];
  assert(feedbackWidget?.mimeType === 'text/html;profile=mcp-app', 'feedback widget MIME type is unexpected');
  assert(/data-rating="positive"/.test(feedbackWidget.text || ''), 'feedback widget rating controls are missing');
  assert(/api\/agent\/feedback/.test(feedbackWidget.text || ''), 'feedback widget first-party submit route is missing');
  assert(!/window\.openai\.callTool/.test(feedbackWidget.text || ''), 'feedback widget must not send feedback through MCP');

  const accountOpen = structured(await rpc('tools/call', {
    name: 'open_account_signup',
    arguments: {}
  }, 'open_account_signup'));
  assert(accountOpen.resourceUri === 'ui://cognistration/account-signup/v1.html', 'account signup render resource is unexpected');
  assert(accountOpen.credentialsSubmitted === false, 'account signup tool must not submit credentials');

  const feedbackOpen = structured(await rpc('tools/call', {
    name: 'open_feedback',
    arguments: {}
  }, 'open_feedback'));
  assert(feedbackOpen.resourceUri === 'ui://cognistration/feedback/v1.html', 'feedback render resource is unexpected');
  assert(feedbackOpen.persisted === false, 'feedback render tool must not persist a response');

  const scienceOpen = structured(await rpc('tools/call', {
    name: 'open_science_guide',
    arguments: { targetState: 'gamma', carrierHz: 246, beatHz: 39.5, volume: 64, intentionLabel: 'synthesis' }
  }, 'open_science_guide'));
  assert(scienceOpen.resourceUri === 'ui://cognistration/science-guide/v2.html', 'science guide render resource is unexpected');
  assert(scienceOpen.slides?.length === 7, 'science guide did not return seven slides');
  assert(scienceOpen.boundaries?.audioStarted === false, 'science guide must not start audio');
  assert(scienceOpen.boundaries?.diaryContentIncluded === false, 'science guide must not carry diary content');

  const iosOpenEnvelope = await rpc('tools/call', {
    name: 'get_ios_app_offer',
    arguments: {}
  }, 'get_ios_app_offer');
  const iosOpen = structured(iosOpenEnvelope);
  assert(iosOpen.app?.url?.includes('apps.apple.com'), 'iPhone app offer URL is missing');
  assert(iosOpen.app?.price === '$2.99', 'iPhone app offer price is unexpected');
  assert(iosOpenEnvelope._meta?.ui?.resourceUri === 'ui://cognistration/ios-app/v1.html', 'iPhone app widget metadata is missing');

  const phoneOpenEnvelope = await rpc('tools/call', {
    name: 'open_phone_download_options',
    arguments: { targetState: 'gamma', carrierHz: 246, beatHz: 6, volume: 64 }
  }, 'open_phone_download_options');
  const phoneOpen = structured(phoneOpenEnvelope);
  assert(phoneOpen.resourceUri === 'ui://cognistration/phone-download/v1.html', 'phone download render resource is unexpected');
  assert(phoneOpen.phonePreview?.amountCents === 50, 'phone preview amount is not 50 cents');
  assert(phoneOpen.phonePreview?.requiresAccount === false, 'phone preview unexpectedly requires an account');
  assert(phoneOpen.phonePreview?.requiresExplicitConfirmation === true, 'phone preview is missing explicit confirmation');
  assert(phoneOpen.iosApp?.price === '$2.99', 'phone download iPhone offer price is unexpected');
  assert(phoneOpenEnvelope._meta?.ui?.resourceUri === 'ui://cognistration/phone-download/v1.html', 'phone download widget metadata is missing');

  const tonePackOpen = structured(await rpc('tools/call', {
    name: 'open_tone_pack_checkout',
    arguments: { slug: 'full-spectrum-pack' }
  }, 'open_tone_pack_checkout'));
  assert(tonePackOpen.resourceUri === 'ui://cognistration/tone-pack-checkout/v1.html', 'tone-pack checkout render resource is unexpected');
  assert(tonePackOpen.selectedPack?.slug === 'full-spectrum-pack', 'tone-pack checkout did not select the requested pack');
  assert(tonePackOpen.userSubmissionRequired === true, 'tone-pack checkout must require user submission');
  assert(tonePackOpen.paymentSubmitted === false, 'tone-pack checkout must not submit payment while rendering');

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

  const tonePackPaymentResult = structured(await rpc('tools/call', {
    name: 'get_tone_pack_payment_options',
    arguments: {}
  }, 'get_tone_pack_payment_options'));
  assert(tonePackPaymentResult.status === 'enabled', 'tone-pack machine-payment provider is not enabled');
  assert(tonePackPaymentResult.amountCents === 599, 'tone-pack machine-payment amount is not $5.99');
  assert(tonePackPaymentResult.endpoint.endsWith('/api/machine-payments/tone-pack'), 'tone-pack machine-payment endpoint is missing');

  const tryResponse = await fetch(new URL('/try', requestOrigin));
  const tryText = await tryResponse.text();
  const normalizedTryText = tryText.replace(/<!-- -->/g, '');
  assert(tryResponse.ok, `/try returned HTTP ${tryResponse.status}`);
  assert(/30 public MCP tools/.test(normalizedTryText), '/try does not show the current MCP tool count');
  assert(!/29 public MCP tools/.test(normalizedTryText), '/try still shows the retired MCP tool count');
  assert(!/27 public MCP tools/.test(tryText), '/try contains the retired MCP tool count');

  console.log(JSON.stringify({
    endpoint,
    protocol: protocolVersion,
    serverDiscover: 'ok',
    tools: tools.length,
    skills: skills.map((skill) => skill.frontmatter.name),
    fetchedSkill: skillResult.skill.frontmatter.name,
    safetyRoute: interaction.safetyRouting.route,
    machineWidget: 'frequency-wave',
    clarificationChoices: clarifyResult.choices.length,
    recipeVersion: recipeResult.recipe.recipeVersion,
    scienceGuide: { resourceUri: scienceOpen.resourceUri, slides: scienceOpen.slides.length },
    inPlatformWidgets: { account: accountOpen.resourceUri, feedback: feedbackOpen.resourceUri, tonePack: tonePackOpen.resourceUri, ios: iosOpenEnvelope._meta?.ui?.resourceUri, phone: phoneOpen.resourceUri },
    machinePayment: { status: paymentResult.status, amountCents: paymentResult.amountCents, toneEndpoint: paymentResult.toneSession.endpoint },
    tonePackPayment: { status: tonePackPaymentResult.status, amountCents: tonePackPaymentResult.amountCents, endpoint: tonePackPaymentResult.endpoint }
  }, null, 2));
}

main().catch((error) => {
  console.error(`MCP live test failed: ${error.message}`);
  process.exitCode = 1;
});
