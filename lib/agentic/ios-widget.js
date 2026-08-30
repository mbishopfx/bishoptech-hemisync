import { IOS_APP_STORE_URL } from './ios-capability.js';

export const IOS_APP_WIDGET_RESOURCE_URI = 'ui://cognistration/ios-app/v1.html';
export const IOS_APP_WIDGET_RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

export const IOS_APP_WIDGET_RESOURCE_META = {
  ui: {
    prefersBorder: false,
    domain: 'https://cognistration.com',
    csp: {
      connectDomains: [],
      resourceDomains: ['https://cognistration.com'],
      frameDomains: []
    }
  },
  'openai/widgetDescription': 'A frosted-glass Cognistration iPhone app offer with real app screenshots, the current one-time price, compatibility notes, and a Download Now App Store badge.',
  'openai/widgetPrefersBorder': false,
  'openai/widgetDomain': 'https://cognistration.com',
  'openai/widgetCSP': {
    connect_domains: [],
    resource_domains: ['https://cognistration.com'],
    frame_domains: []
  }
};

const IOS_APP_SCREENSHOTS = [
  {
    src: 'https://cognistration.com/images/ios-app/slide1-tune-your-brain-waves.png',
    alt: 'Cognistration iPhone screen for shaping a listening session',
    label: 'Shape the session'
  },
  {
    src: 'https://cognistration.com/images/ios-app/slide3-custom-binaural-beats.png',
    alt: 'Cognistration iPhone screen for custom audio controls',
    label: 'Build the pattern'
  },
  {
    src: 'https://cognistration.com/images/ios-app/slide5-build-mindful-habits.png',
    alt: 'Cognistration iPhone screen for building a listening routine',
    label: 'Build the routine'
  }
];

const serializedScreenshots = JSON.stringify(IOS_APP_SCREENSHOTS);
const serializedStoreUrl = JSON.stringify(IOS_APP_STORE_URL);

export const IOS_APP_WIDGET_HTML = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cognistration for iPhone</title>
    <style>
      :root {
        color-scheme: dark;
        --ink: #f2f6f2;
        --muted: rgba(242, 246, 242, .68);
        --quiet: rgba(242, 246, 242, .44);
        --edge: rgba(182, 221, 204, .17);
        --highlight: rgba(242, 246, 242, .09);
        --panel: rgba(16, 36, 31, .72);
        --mint: #b6ddcc;
        --deep: #10221d;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      * { box-sizing: border-box; }
      html, body { min-height: 100%; }
      body { margin: 0; background: var(--deep); color: var(--ink); }
      button, a { font: inherit; }
      a { -webkit-tap-highlight-color: rgba(182, 221, 204, .16); }
      a:focus-visible { outline: 2px solid var(--mint); outline-offset: 3px; }
      .app-shell { position: relative; isolation: isolate; max-width: 860px; margin: 0 auto; overflow: hidden; padding: clamp(20px, 4vw, 34px); background: radial-gradient(circle at 92% 0%, rgba(182, 221, 204, .15), transparent 35%), radial-gradient(circle at 0% 100%, rgba(224, 180, 147, .11), transparent 38%), linear-gradient(145deg, #17332c, #0b1d19 64%, #121621); }
      .app-shell::before { position: absolute; inset: 1px; z-index: -1; border-radius: 30px; background: linear-gradient(120deg, rgba(242, 246, 242, .08), transparent 34%, transparent 72%, rgba(182, 221, 204, .06)); content: ""; pointer-events: none; }
      .eyebrow { color: var(--mint); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; }
      .app-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(250px, .9fr); gap: 26px; align-items: center; }
      h1 { max-width: 13ch; margin: 18px 0 0; font-size: clamp(32px, 6vw, 56px); font-weight: 520; letter-spacing: -.065em; line-height: .98; }
      .intro { max-width: 560px; margin: 16px 0 0; color: var(--muted); font-size: 14px; line-height: 1.7; }
      .offer-panel { margin-top: 22px; padding: 17px; border: 1px solid var(--edge); border-radius: 23px; background: linear-gradient(145deg, rgba(182, 221, 204, .1), rgba(255, 255, 255, .02)), var(--panel); box-shadow: inset 0 1px 0 var(--highlight), inset 0 -18px 38px rgba(5, 18, 15, .14), 0 24px 70px rgba(0, 0, 0, .2); backdrop-filter: blur(22px) saturate(125%); -webkit-backdrop-filter: blur(22px) saturate(125%); }
      .price-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
      .price-label { color: var(--quiet); font-size: 11px; line-height: 1.45; }
      .price { color: var(--mint); font-size: 32px; font-weight: 600; letter-spacing: -.06em; line-height: 1; }
      .feature-list { display: grid; gap: 10px; margin: 18px 0 0; padding: 17px 0 0; border-top: 1px solid rgba(182, 221, 204, .1); }
      .feature { display: flex; gap: 10px; color: var(--muted); font-size: 12px; line-height: 1.45; }
      .feature::before { width: 6px; height: 6px; flex: 0 0 auto; margin-top: 5px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 0 4px rgba(182, 221, 204, .09); content: ""; }
      .store-badge { display: flex; min-height: 54px; align-items: center; gap: 10px; margin-top: 21px; padding: 9px 12px; border: 1px solid rgba(182, 221, 204, .22); border-radius: 17px; background: linear-gradient(135deg, rgba(182, 221, 204, .18), rgba(255, 255, 255, .035)), rgba(8, 25, 20, .52); box-shadow: inset 0 1px 0 rgba(242, 246, 242, .12), 0 14px 30px rgba(0, 0, 0, .14); color: var(--ink); text-decoration: none; transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, box-shadow 180ms ease; }
      .store-badge:hover { transform: translateY(-2px); border-color: rgba(182, 221, 204, .5); background: linear-gradient(135deg, rgba(182, 221, 204, .27), rgba(255, 255, 255, .06)), rgba(8, 25, 20, .6); box-shadow: inset 0 1px 0 rgba(242, 246, 242, .18), 0 18px 36px rgba(0, 0, 0, .2); }
      .store-badge:active { transform: translateY(0) scale(.985); }
      .store-mark { display: grid; width: 31px; height: 31px; place-items: center; border-radius: 9px; background: var(--mint); color: var(--deep); font-size: 18px; font-weight: 800; line-height: 1; }
      .store-copy { display: grid; gap: 1px; }
      .store-copy small { color: var(--quiet); font-size: 9px; letter-spacing: .04em; }
      .store-copy strong { font-size: 15px; letter-spacing: -.02em; }
      .store-action { margin-left: auto; color: var(--mint); font-size: 11px; font-weight: 650; white-space: nowrap; }
      .availability { margin: 12px 1px 0; color: rgba(242, 246, 242, .37); font-size: 10px; line-height: 1.5; }
      .screenshot-stage { position: relative; min-height: 380px; }
      .screenshot-stage::before { position: absolute; inset: 18% 12% 8%; border-radius: 50%; background: rgba(182, 221, 204, .14); filter: blur(44px); content: ""; }
      .screenshot { position: absolute; bottom: 0; width: 43%; overflow: hidden; border: 1px solid rgba(182, 221, 204, .18); border-radius: 28px; background: #0a1714; box-shadow: 0 26px 60px rgba(0, 0, 0, .32); transform: rotate(-7deg); }
      .screenshot img { display: block; width: 100%; height: auto; }
      .screenshot--left { left: 3%; opacity: .63; transform: rotate(-10deg) translateY(18px) scale(.9); }
      .screenshot--center { left: 28%; z-index: 2; transform: rotate(2deg); }
      .screenshot--right { right: 2%; opacity: .78; transform: rotate(11deg) translateY(10px) scale(.94); }
      .screenshot-label { position: absolute; right: 10px; bottom: 10px; left: 10px; padding: 7px 9px; border-radius: 11px; background: rgba(7, 20, 16, .72); color: var(--quiet); font-size: 9px; backdrop-filter: blur(12px); }
      .status { min-height: 18px; margin: 12px 1px 0; color: var(--mint); font-size: 11px; line-height: 1.5; }
      [hidden] { display: none !important; }
      @media (max-width: 680px) { .app-grid { grid-template-columns: 1fr; gap: 12px; } .screenshot-stage { min-height: 340px; max-width: 430px; margin: 0 auto; width: 100%; } }
      @media (max-width: 420px) { .app-shell { padding: 18px; } .screenshot-stage { min-height: 300px; } .store-action { display: none; } }
      @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: .01ms !important; } }
    </style>
  </head>
  <body>
    <main class="app-shell" data-ios-app-widget>
      <div class="app-grid">
        <section aria-labelledby="ios-app-title">
          <div class="eyebrow">Cognistration · iPhone app</div>
          <h1 id="ios-app-title">Your listening practice, close at hand.</h1>
          <p class="intro">The full Cognistration experience runs on-device, so custom controls, saved presets, widgets, and Shortcuts stay close without an account or recurring subscription.</p>
          <div class="offer-panel">
            <div class="price-row"><span class="price-label">Full app access<br>one-time purchase</span><strong class="price" id="app-price">$2.99</strong></div>
            <div class="feature-list" id="app-features"></div>
            <a class="store-badge" id="app-store-link" href="${IOS_APP_STORE_URL}" target="_blank" rel="noreferrer">
              <span class="store-mark" aria-hidden="true">A</span>
              <span class="store-copy"><small>Download on the</small><strong>App Store</strong></span>
              <span class="store-action">Download now</span>
            </a>
            <p class="availability" id="app-availability">iPhone · iOS 18 or later. Apple controls final availability and regional pricing.</p>
            <div class="status" id="app-status" role="status" aria-live="polite"></div>
          </div>
        </section>
        <section class="screenshot-stage" id="app-screenshot-stage" aria-label="Cognistration iPhone app screenshots"></section>
      </div>
    </main>
    <script>
      (function () {
        'use strict';
        var SCREENSHOTS = ${serializedScreenshots};
        var STORE_URL = ${serializedStoreUrl};
        var fallbackFeatures = ['On-device audio sessions', 'Custom controls and saved presets', 'Home Screen widget and App Shortcut support', 'No account, ads, social feed, or subscription'];
        var elements = {
          price: document.getElementById('app-price'),
          features: document.getElementById('app-features'),
          availability: document.getElementById('app-availability'),
          status: document.getElementById('app-status'),
          store: document.getElementById('app-store-link'),
          stage: document.getElementById('app-screenshot-stage')
        };

        function asObject(value) {
          if (!value) return {};
          if (typeof value === 'string') { try { return asObject(JSON.parse(value)); } catch (error) { return {}; } }
          if (value.structuredContent) return asObject(value.structuredContent);
          if (value.result) return asObject(value.result);
          return value;
        }

        function renderFeatures(features) {
          elements.features.replaceChildren();
          (Array.isArray(features) && features.length ? features : fallbackFeatures).forEach(function (feature) {
            var row = document.createElement('div');
            row.className = 'feature';
            row.textContent = String(feature);
            elements.features.appendChild(row);
          });
        }

        function renderScreenshots() {
          elements.stage.replaceChildren();
          SCREENSHOTS.forEach(function (screenshot, index) {
            var figure = document.createElement('figure');
            figure.className = 'screenshot screenshot--' + (index === 0 ? 'left' : index === 1 ? 'center' : 'right');
            var image = document.createElement('img');
            image.src = screenshot.src;
            image.alt = screenshot.alt;
            image.width = 1290;
            image.height = 2796;
            image.loading = 'lazy';
            figure.appendChild(image);
            var label = document.createElement('figcaption');
            label.className = 'screenshot-label';
            label.textContent = screenshot.label;
            figure.appendChild(label);
            elements.stage.appendChild(figure);
          });
        }

        function hydrate(value) {
          var data = asObject(value);
          var app = data.app && typeof data.app === 'object' ? data.app : {};
          if (app.price) elements.price.textContent = String(app.price);
          renderFeatures(app.features);
          if (app.requires) elements.availability.textContent = String(app.requires) + '. ' + String(app.availabilityNote || 'Apple controls final availability and regional pricing.');
        }

        elements.store.addEventListener('click', function (event) {
          var host = window.openai || {};
          if (typeof host.openExternal !== 'function') return;
          event.preventDefault();
          try {
            var result = host.openExternal({ href: STORE_URL, redirectUrl: false });
            if (result && typeof result.catch === 'function') result.catch(function () { elements.status.textContent = 'Use the App Store badge again to continue.'; });
          } catch (error) {
            elements.status.textContent = 'Use the App Store badge again to continue.';
          }
        });

        renderScreenshots();
        var host = window.openai || {};
        hydrate(host.toolInput || {});
        hydrate(host.toolOutput || host.widgetOutput || {});
      }());
    </script>
  </body>
</html>`;
