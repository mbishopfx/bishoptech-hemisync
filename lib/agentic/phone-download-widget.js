import { IOS_APP_STORE_URL } from './ios-capability.js';

export const PHONE_DOWNLOAD_WIDGET_RESOURCE_META = {
  ui: {
    prefersBorder: false,
    domain: 'https://cognistration.com',
    csp: {
      connectDomains: [],
      resourceDomains: ['https://cognistration.com'],
      frameDomains: []
    }
  },
  'openai/widgetDescription': 'A frosted-glass phone handoff card offering a fixed $0.50 agent-to-agent tone preview with explicit confirmation and a separate Cognistration iPhone App Store path.',
  'openai/widgetPrefersBorder': false,
  'openai/widgetDomain': 'https://cognistration.com',
  'openai/widgetCSP': {
    connect_domains: [],
    resource_domains: ['https://cognistration.com'],
    frame_domains: []
  }
};

const serializedStoreUrl = JSON.stringify(IOS_APP_STORE_URL);

export const PHONE_DOWNLOAD_WIDGET_HTML = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cognistration phone options</title>
    <style>
      :root {
        color-scheme: dark;
        --ink: #f2f6f2;
        --muted: rgba(242, 246, 242, .68);
        --quiet: rgba(242, 246, 242, .43);
        --edge: rgba(182, 221, 204, .17);
        --highlight: rgba(242, 246, 242, .09);
        --panel: rgba(16, 36, 31, .72);
        --mint: #b6ddcc;
        --sand: #e0b493;
        --deep: #10221d;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      * { box-sizing: border-box; }
      html, body { min-height: 100%; }
      body { margin: 0; background: var(--deep); color: var(--ink); }
      button, a { font: inherit; }
      button, a { -webkit-tap-highlight-color: rgba(182, 221, 204, .16); }
      button:focus-visible, a:focus-visible { outline: 2px solid var(--mint); outline-offset: 3px; }
      .phone-shell { position: relative; isolation: isolate; max-width: 820px; margin: 0 auto; overflow: hidden; padding: clamp(20px, 4vw, 32px); background: radial-gradient(circle at 92% 0%, rgba(182, 221, 204, .15), transparent 35%), radial-gradient(circle at 0% 100%, rgba(224, 180, 147, .11), transparent 38%), linear-gradient(145deg, #17332c, #0b1d19 64%, #121621); }
      .phone-shell::before { position: absolute; inset: 1px; z-index: -1; border-radius: 30px; background: linear-gradient(120deg, rgba(242, 246, 242, .08), transparent 34%, transparent 72%, rgba(182, 221, 204, .06)); content: ""; pointer-events: none; }
      .eyebrow { color: var(--mint); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; }
      h1 { max-width: 17ch; margin: 17px 0 0; font-size: clamp(30px, 6vw, 50px); font-weight: 520; letter-spacing: -.06em; line-height: .99; }
      .intro { max-width: 650px; margin: 14px 0 0; color: var(--muted); font-size: 14px; line-height: 1.65; }
      .tone-context { display: none; margin-top: 17px; color: var(--quiet); font-size: 11px; line-height: 1.5; }
      .tone-context[data-visible="true"] { display: block; }
      .options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; margin-top: 24px; }
      .option { position: relative; display: flex; min-height: 270px; flex-direction: column; padding: 18px; border: 1px solid var(--edge); border-radius: 23px; background: linear-gradient(145deg, rgba(182, 221, 204, .1), rgba(255, 255, 255, .02)), var(--panel); box-shadow: inset 0 1px 0 var(--highlight), inset 0 -18px 38px rgba(5, 18, 15, .14), 0 24px 70px rgba(0, 0, 0, .2); backdrop-filter: blur(22px) saturate(125%); -webkit-backdrop-filter: blur(22px) saturate(125%); }
      .option--app { background: linear-gradient(145deg, rgba(224, 180, 147, .1), rgba(255, 255, 255, .02)), var(--panel); }
      .option-label { color: var(--quiet); font-size: 11px; }
      .option h2 { margin: 12px 0 0; font-size: 22px; font-weight: 550; letter-spacing: -.045em; line-height: 1.05; }
      .option-copy { min-height: 77px; margin: 12px 0 0; color: var(--muted); font-size: 12px; line-height: 1.6; }
      .option-meta { margin-top: auto; padding-top: 14px; border-top: 1px solid rgba(182, 221, 204, .1); color: var(--quiet); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9px; letter-spacing: .07em; line-height: 1.55; text-transform: uppercase; }
      .action, .store-badge { display: inline-flex; min-height: 45px; align-items: center; justify-content: center; margin-top: 14px; border: 1px solid rgba(182, 221, 204, .22); border-radius: 999px; background: linear-gradient(135deg, rgba(182, 221, 204, .18), rgba(255, 255, 255, .035)), rgba(8, 25, 20, .52); box-shadow: inset 0 1px 0 rgba(242, 246, 242, .12), 0 14px 30px rgba(0, 0, 0, .14); color: var(--ink); padding: 0 15px; text-decoration: none; transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, box-shadow 180ms ease; }
      .action:hover, .store-badge:hover { transform: translateY(-2px); border-color: rgba(182, 221, 204, .5); background: linear-gradient(135deg, rgba(182, 221, 204, .27), rgba(255, 255, 255, .06)), rgba(8, 25, 20, .6); box-shadow: inset 0 1px 0 rgba(242, 246, 242, .18), 0 18px 36px rgba(0, 0, 0, .2); }
      .action:active, .store-badge:active { transform: translateY(0) scale(.985); }
      .action { width: 100%; cursor: pointer; }
      .action:disabled { cursor: not-allowed; opacity: .48; transform: none; }
      .store-badge { justify-content: flex-start; gap: 9px; padding: 7px 10px; }
      .store-mark { display: grid; width: 28px; height: 28px; flex: 0 0 auto; place-items: center; border-radius: 8px; background: var(--sand); color: var(--deep); font-size: 16px; font-weight: 800; }
      .store-copy { display: grid; gap: 1px; }
      .store-copy small { color: var(--quiet); font-size: 8px; }
      .store-copy strong { font-size: 13px; }
      .store-price { margin-left: auto; color: var(--sand); font-size: 11px; font-weight: 650; white-space: nowrap; }
      .status { min-height: 20px; margin: 16px 1px 0; color: var(--mint); font-size: 11px; line-height: 1.5; }
      .note { margin: 17px 1px 0; color: rgba(242, 246, 242, .36); font-size: 10px; line-height: 1.55; }
      [hidden] { display: none !important; }
      @media (max-width: 620px) { .options { grid-template-columns: 1fr; } .option { min-height: 0; } .option-copy { min-height: 0; } }
      @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: .01ms !important; } }
    </style>
  </head>
  <body>
    <main class="phone-shell" data-phone-download-widget>
      <div class="eyebrow">Cognistration · take it to your phone</div>
      <h1 id="phone-title">Two ways to continue.</h1>
      <p class="intro">Choose a one-off phone-ready preview through the connected agent, or download the complete on-device iPhone app. Both paths keep the next step clear.</p>
      <p class="tone-context" id="tone-context" data-visible="false"></p>
      <div class="options">
        <section class="option" aria-labelledby="preview-title">
          <span class="option-label">Agent-to-agent preview</span>
          <h2 id="preview-title">One phone-ready session</h2>
          <p class="option-copy">A compatible agent can prepare the fixed $0.50 payment challenge for this tone. No account is required, and nothing is charged until you explicitly approve it.</p>
          <div class="option-meta" id="preview-meta">$0.50 · no account · explicit approval</div>
          <button class="action" id="preview-request" type="button">Request the $0.50 preview</button>
        </section>
        <section class="option option--app" aria-labelledby="app-title">
          <span class="option-label">Full iPhone app</span>
          <h2 id="app-title">Keep the whole machine</h2>
          <p class="option-copy">On-device audio, custom controls, saved presets, widgets, and Shortcuts with one $2.99 App Store purchase. No account or subscription.</p>
          <div class="option-meta">iPhone · iOS 18 or later</div>
          <a class="store-badge" id="app-store-link" href="${IOS_APP_STORE_URL}" target="_blank" rel="noreferrer"><span class="store-mark" aria-hidden="true">A</span><span class="store-copy"><small>Download on the</small><strong>App Store</strong></span><span class="store-price">$2.99 once</span></a>
        </section>
      </div>
      <div class="status" id="phone-status" role="status" aria-live="polite"></div>
      <p class="note">The $0.50 route is an agent-payment handoff, not a direct browser charge. The compatible agent sends the MPP credential as Authorization: Payment &lt;credential&gt;; Payment-Authorization is accepted for compatibility. The server verifies the provider receipt before releasing a session.</p>
    </main>
    <script>
      (function () {
        'use strict';
        var STORE_URL = ${serializedStoreUrl};
        var data = {};
        var elements = {
          title: document.getElementById('phone-title'),
          context: document.getElementById('tone-context'),
          previewMeta: document.getElementById('preview-meta'),
          preview: document.getElementById('preview-request'),
          store: document.getElementById('app-store-link'),
          status: document.getElementById('phone-status')
        };

        function asObject(value) {
          if (!value) return {};
          if (typeof value === 'string') { try { return asObject(JSON.parse(value)); } catch (error) { return {}; } }
          if (value.structuredContent) return asObject(value.structuredContent);
          if (value.result) return asObject(value.result);
          return value;
        }

        function setStatus(message) { elements.status.textContent = String(message || ''); }

        function hydrate(value) {
          var next = asObject(value);
          if (next.tone || next.controls || next.phonePreview || next.iosApp) data = Object.assign({}, data, next);
          var tone = data.tone;
          var controls = data.controls || {};
          var payment = data.phonePreview || {};
          if (tone && tone.name) {
            elements.context.textContent = 'Current tone: ' + String(tone.name) + ' · ' + String(controls.targetState || tone.state || 'theta') + ' · ' + String(Math.round(Number(controls.carrierHz || tone.baseFreqHz || 200))) + ' Hz';
            elements.context.dataset.visible = 'true';
            elements.title.textContent = 'Continue ' + String(tone.name) + ' on your phone.';
          }
          if (payment.price) elements.previewMeta.textContent = String(payment.price) + ' · no account · explicit approval';
          if (payment.status && payment.status !== 'enabled') {
            elements.preview.disabled = true;
            elements.preview.textContent = 'Agent preview is unavailable';
            setStatus(String(payment.message || 'The fixed-price agent route is not enabled yet.'));
          }
        }

        function phonePreviewPrompt() {
          var tone = data.tone || {};
          var controls = data.controls || {};
          var label = tone.name ? String(tone.name) : 'the current generated tone';
          var details = tone.id ? ' Tone ID: ' + String(tone.id) + '.' : '';
          if (controls.targetState || controls.carrierHz || controls.beatHz) details += ' Current settings: ' + String(controls.targetState || 'theta') + ', ' + String(Math.round(Number(controls.carrierHz || 200))) + ' Hz carrier, ' + String(Number(controls.beatHz || 6).toFixed(1)) + ' Hz difference.';
          return 'I want the fixed $0.50 no-account phone-ready preview for ' + label + '.' + details + ' Please show the exact agent-to-agent payment challenge and ask for my explicit confirmation before any payment. Do not charge, claim payment, or release a download until I approve it.';
        }

        elements.preview.addEventListener('click', function () {
          var host = window.openai || {};
          if (typeof host.sendFollowUpMessage !== 'function') {
            setStatus('Use this request in a connected Cognistration app host to prepare the $0.50 payment challenge.');
            return;
          }
          elements.preview.disabled = true;
          setStatus('Asking the connected agent to prepare the fixed-price route…');
          try {
            var result = host.sendFollowUpMessage({ prompt: phonePreviewPrompt(), scrollToBottom: true });
            if (result && typeof result.catch === 'function') {
              result.catch(function () { elements.preview.disabled = false; setStatus('The agent could not be reached. Try the request again.'); });
            }
          } catch (error) {
            elements.preview.disabled = false;
            setStatus('The agent could not be reached. Try the request again.');
          }
        });

        elements.store.addEventListener('click', function (event) {
          var host = window.openai || {};
          if (typeof host.openExternal !== 'function') return;
          event.preventDefault();
          try {
            var result = host.openExternal({ href: STORE_URL, redirectUrl: false });
            if (result && typeof result.catch === 'function') result.catch(function () { setStatus('Use the App Store badge again to continue.'); });
          } catch (error) {
            setStatus('Use the App Store badge again to continue.');
          }
        });

        var host = window.openai || {};
        hydrate(host.toolInput || {});
        hydrate(host.toolOutput || host.widgetOutput || {});
      }());
    </script>
  </body>
</html>`;
