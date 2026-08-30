import { PUBLIC_TONE_PACK_CATALOG } from './pack-capability.js';

export const TONE_PACK_CHECKOUT_WIDGET_RESOURCE_URI = 'ui://cognistration/tone-pack-checkout/v1.html';
export const TONE_PACK_CHECKOUT_WIDGET_RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

export const TONE_PACK_CHECKOUT_WIDGET_RESOURCE_META = {
  ui: {
    prefersBorder: false,
    domain: 'https://cognistration.com',
    csp: {
      connectDomains: ['https://cognistration.com'],
      resourceDomains: ['https://cognistration.com', 'https://lmzzkrcbcucosypiminc.supabase.co'],
      frameDomains: []
    }
  },
  'openai/widgetDescription': 'A frosted-glass Cognistration tone-pack card that collects a delivery email, creates a reviewable hosted checkout, and reveals a verified download button after payment.',
  'openai/widgetPrefersBorder': false,
  'openai/widgetDomain': 'https://cognistration.com',
  'openai/widgetCSP': {
    connect_domains: ['https://cognistration.com'],
    resource_domains: ['https://cognistration.com', 'https://lmzzkrcbcucosypiminc.supabase.co'],
    frame_domains: []
  }
};

const serializedPacks = JSON.stringify(PUBLIC_TONE_PACK_CATALOG.map((pack) => ({
  slug: pack.slug,
  name: pack.name,
  summary: pack.summary,
  states: pack.states,
  price: pack.price,
  durationLabel: pack.durationLabel
})));

export const TONE_PACK_CHECKOUT_WIDGET_HTML = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cognistration tone pack</title>
    <style>
      :root {
        color-scheme: dark;
        --ink: #f2f6f2;
        --muted: rgba(242, 246, 242, .68);
        --quiet: rgba(242, 246, 242, .43);
        --edge: rgba(182, 221, 204, .16);
        --highlight: rgba(242, 246, 242, .09);
        --panel: rgba(16, 36, 31, .74);
        --mint: #b6ddcc;
        --deep: #10221d;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      * { box-sizing: border-box; }
      html, body { min-height: 100%; }
      body { margin: 0; background: var(--deep); color: var(--ink); }
      button, input, select, a { font: inherit; }
      button, a { -webkit-tap-highlight-color: rgba(182, 221, 204, .16); }
      button:focus-visible, input:focus-visible, select:focus-visible, a:focus-visible { outline: 2px solid var(--mint); outline-offset: 3px; }
      .pack-shell { position: relative; isolation: isolate; max-width: 720px; margin: 0 auto; overflow: hidden; padding: 24px; background: radial-gradient(circle at 88% 0%, rgba(182, 221, 204, .16), transparent 42%), radial-gradient(circle at 0% 100%, rgba(224, 180, 147, .1), transparent 38%), linear-gradient(145deg, #17332c, #0b1d19 62%, #121621); }
      .pack-shell::before { position: absolute; inset: 1px; z-index: -1; border-radius: 28px; background: linear-gradient(120deg, rgba(242, 246, 242, .08), transparent 32%, transparent 72%, rgba(182, 221, 204, .06)); content: ""; pointer-events: none; }
      .eyebrow { color: var(--mint); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; letter-spacing: .18em; text-transform: uppercase; }
      h1 { max-width: 15ch; margin: 18px 0 0; font-size: clamp(30px, 6vw, 48px); font-weight: 520; letter-spacing: -.06em; line-height: 1; }
      .intro { max-width: 610px; margin: 14px 0 0; color: var(--muted); font-size: 14px; line-height: 1.65; }
      .pack-panel, .delivery-panel { position: relative; margin-top: 22px; border: 1px solid var(--edge); border-radius: 24px; background: linear-gradient(145deg, rgba(182, 221, 204, .1), rgba(255, 255, 255, .02)), var(--panel); box-shadow: inset 0 1px 0 var(--highlight), inset 0 -18px 38px rgba(5, 18, 15, .14), 0 24px 70px rgba(0, 0, 0, .2); backdrop-filter: blur(22px) saturate(125%); -webkit-backdrop-filter: blur(22px) saturate(125%); }
      .pack-panel { padding: 18px; }
      .field-label { display: block; color: var(--muted); font-size: 12px; font-weight: 650; }
      .pack-select, .email-input { width: 100%; min-height: 46px; margin-top: 8px; border: 1px solid rgba(182, 221, 204, .16); border-radius: 14px; background: linear-gradient(135deg, rgba(182, 221, 204, .08), rgba(255, 255, 255, .025)), rgba(6, 20, 16, .5); box-shadow: inset 0 1px 0 rgba(242, 246, 242, .07); color: var(--ink); padding: 0 13px; }
      .email-input { padding: 0 13px; }
      .email-input::placeholder { color: rgba(242, 246, 242, .32); }
      .pack-select:focus, .email-input:focus { border-color: rgba(182, 221, 204, .5); box-shadow: inset 0 1px 0 rgba(242, 246, 242, .12), 0 0 0 3px rgba(182, 221, 204, .09); outline: 0; }
      .pack-summary { min-height: 54px; margin-top: 11px; color: var(--quiet); font-size: 12px; line-height: 1.55; }
      .pack-meta { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 11px; }
      .meta-pill { border: 1px solid rgba(182, 221, 204, .12); border-radius: 999px; background: rgba(182, 221, 204, .06); box-shadow: inset 0 1px 0 rgba(242, 246, 242, .06); color: var(--quiet); padding: 6px 9px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 9px; letter-spacing: .06em; text-transform: uppercase; }
      .price-line { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-top: 20px; border-top: 1px solid rgba(182, 221, 204, .1); padding-top: 15px; }
      .price-line span { color: var(--quiet); font-size: 12px; }
      .price-line strong { color: var(--mint); font-size: 22px; font-weight: 600; letter-spacing: -.04em; }
      .email-field { margin-top: 17px; }
      .consent { display: flex; align-items: flex-start; gap: 9px; margin-top: 14px; color: var(--quiet); font-size: 11px; line-height: 1.5; }
      .consent input { width: 16px; height: 16px; flex: 0 0 auto; margin: 1px 0 0; accent-color: var(--mint); }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 17px; }
      .action, .checkout-link { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; border: 1px solid rgba(182, 221, 204, .2); border-radius: 999px; background: linear-gradient(135deg, rgba(182, 221, 204, .15), rgba(255, 255, 255, .035)), rgba(12, 31, 25, .48); box-shadow: inset 0 1px 0 rgba(242, 246, 242, .11), inset 0 -8px 18px rgba(3, 12, 10, .1), 0 10px 25px rgba(0, 0, 0, .12); color: var(--ink); padding: 0 16px; text-decoration: none; cursor: pointer; transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, box-shadow 180ms ease; }
      .action { flex: 1 1 230px; }
      .action:hover, .checkout-link:hover { transform: translateY(-2px); border-color: rgba(182, 221, 204, .46); background: linear-gradient(135deg, rgba(182, 221, 204, .23), rgba(255, 255, 255, .05)), rgba(12, 31, 25, .56); box-shadow: inset 0 1px 0 rgba(242, 246, 242, .17), 0 15px 32px rgba(0, 0, 0, .18); }
      .action:active, .checkout-link:active { transform: translateY(0) scale(.985); }
      .action:disabled { cursor: wait; opacity: .45; transform: none; }
      .checkout-link { width: 100%; color: var(--deep); background: var(--mint); border-color: rgba(242, 246, 242, .32); box-shadow: 0 12px 30px rgba(96, 153, 128, .2); font-weight: 700; }
      .checkout-link:hover { background: #d7eadf; border-color: rgba(242, 246, 242, .62); }
      .status { min-height: 20px; margin: 14px 2px 0; color: var(--quiet); font-size: 12px; line-height: 1.5; }
      .status[data-kind="error"] { color: #f2b9a5; }
      .status[data-kind="success"] { color: var(--mint); }
      .delivery-panel { padding: 18px; }
      .delivery-panel h2 { margin: 0; font-size: 19px; font-weight: 550; letter-spacing: -.04em; }
      .delivery-panel p { margin: 8px 0 0; color: var(--muted); font-size: 12px; line-height: 1.6; }
      .delivery-detail { margin-top: 13px; border-top: 1px solid rgba(182, 221, 204, .1); padding-top: 13px; color: var(--quiet); font-size: 11px; line-height: 1.55; }
      .note { margin: 15px 2px 0; color: rgba(242, 246, 242, .34); font-size: 10px; line-height: 1.55; }
      [hidden] { display: none !important; }
      @media (max-width: 520px) { .pack-shell { padding: 18px; } .actions { display: grid; } .action { width: 100%; } }
      @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: .01ms !important; } }
    </style>
  </head>
  <body>
    <main class="pack-shell" data-tone-pack-widget>
      <div class="eyebrow">Cognistration · finished listening library</div>
      <h1>Take the full spectrum with you.</h1>
      <p class="intro">Choose a published pack, add the email where you want delivery, and review the one-time $5.99 checkout. After payment is verified, this card reveals a download button and the email fallback.</p>

      <section class="pack-panel" aria-labelledby="pack-label">
        <label class="field-label" id="pack-label" for="pack-select">Choose a tone pack</label>
        <select class="pack-select" id="pack-select"></select>
        <div class="pack-summary" id="pack-summary"></div>
        <div class="pack-meta" id="pack-meta"></div>
        <div class="price-line"><span>One-time purchase · no account required</span><strong id="pack-price">$5.99</strong></div>
        <div class="email-field">
          <label class="field-label" for="delivery-email">Delivery email</label>
          <input class="email-input" id="delivery-email" type="email" autocomplete="email" maxlength="254" placeholder="you@example.com">
        </div>
        <label class="consent"><input id="purchase-confirmation" type="checkbox"><span>I confirm the selected pack, the $5.99 one-time price, and this delivery email. The secure checkout opens for my review.</span></label>
        <div class="actions"><button class="action" id="checkout-button" type="button">Continue to secure checkout</button></div>
        <div class="status" id="checkout-status" role="status" aria-live="polite"></div>
      </section>

      <section class="delivery-panel" id="delivery-panel" hidden aria-labelledby="delivery-title">
        <h2 id="delivery-title">Your pack is ready</h2>
        <p id="delivery-copy">Payment was verified by Cognistration.</p>
        <a class="checkout-link" id="download-link" href="#" target="_blank" rel="noreferrer">Download pack</a>
        <div class="delivery-detail" id="delivery-detail"></div>
      </section>
      <p class="note">Compatible agents can use the fixed-price Machine Payments Protocol route. This card uses hosted Checkout so the person can review the charge; payment credentials never enter the widget.</p>
    </main>
    <script>
      (function () {
        'use strict';
        var PACKS = ${serializedPacks};
        var DEFAULT_SLUG = 'full-spectrum-pack';
        var selectedSlug = DEFAULT_SLUG;
        var checkoutSessionId = null;
        var requestSequence = 0;
        var pendingRequests = new Map();
        var elements = {
          select: document.getElementById('pack-select'),
          summary: document.getElementById('pack-summary'),
          meta: document.getElementById('pack-meta'),
          price: document.getElementById('pack-price'),
          email: document.getElementById('delivery-email'),
          confirmation: document.getElementById('purchase-confirmation'),
          checkout: document.getElementById('checkout-button'),
          status: document.getElementById('checkout-status'),
          delivery: document.getElementById('delivery-panel'),
          deliveryCopy: document.getElementById('delivery-copy'),
          download: document.getElementById('download-link'),
          deliveryDetail: document.getElementById('delivery-detail')
        };

        function asObject(value) {
          if (!value) return {};
          if (typeof value === 'string') { try { return asObject(JSON.parse(value)); } catch (error) { return {}; } }
          if (value.structuredContent) return asObject(value.structuredContent);
          if (value.result) return asObject(value.result);
          return value;
        }

        function setStatus(message, kind) {
          elements.status.textContent = message || '';
          elements.status.dataset.kind = kind || 'neutral';
        }

        function findPack(slug) {
          return PACKS.find(function (pack) { return pack.slug === slug; }) || PACKS.find(function (pack) { return pack.slug === DEFAULT_SLUG; }) || PACKS[0];
        }

        function renderPack() {
          var pack = findPack(selectedSlug);
          if (!pack) return;
          selectedSlug = pack.slug;
          elements.select.value = selectedSlug;
          elements.summary.textContent = pack.summary || 'A finished Cognistration listening collection.';
          elements.price.textContent = pack.price || '$5.99';
          elements.meta.replaceChildren();
          [Array.isArray(pack.states) ? pack.states.join(' · ') : 'public collection', pack.durationLabel || 'About 50 minutes'].forEach(function (value) {
            var pill = document.createElement('span');
            pill.className = 'meta-pill';
            pill.textContent = String(value);
            elements.meta.appendChild(pill);
          });
        }

        function hydratePack(value) {
          var data = asObject(value);
          var selected = data.selectedPack || data.pack;
          if (selected && selected.slug && findPack(selected.slug)) selectedSlug = selected.slug;
          if (data.checkoutSessionId) checkoutSessionId = String(data.checkoutSessionId);
          if (data.status === 'checkout_required' && data.checkoutUrl) {
            showCheckout(data);
          } else if (data.status === 'paid' && data.downloadUrl) {
            showDelivery(data);
          }
          if (data.error) setStatus(String(data.error.safeMessage || data.error.message || 'That request could not be completed.'), 'error');
          renderPack();
        }

        function showCheckout(data) {
          checkoutSessionId = data.checkoutSessionId ? String(data.checkoutSessionId) : checkoutSessionId;
          var link = document.getElementById('checkout-link');
          if (!link) {
            link = document.createElement('a');
            link.id = 'checkout-link';
            link.className = 'checkout-link';
            link.target = '_blank';
            link.rel = 'noreferrer';
            link.textContent = 'Open secure checkout';
            elements.checkout.parentNode.insertBefore(link, elements.status);
          }
          link.href = String(data.checkoutUrl);
          link.hidden = false;
          elements.checkout.textContent = 'I’ve paid — show my download';
          elements.checkout.dataset.mode = 'delivery';
          elements.confirmation.disabled = true;
          elements.email.disabled = true;
          elements.select.disabled = true;
          setStatus('Checkout is ready. Complete it in the secure page, then return here.', 'success');
        }

        function showDelivery(data) {
          var pack = data.pack || findPack(selectedSlug);
          if (pack && pack.slug) selectedSlug = pack.slug;
          elements.delivery.hidden = false;
          elements.deliveryCopy.textContent = String(pack && pack.name ? pack.name : 'Your tone pack') + ' is ready. Payment was verified server-side.';
          elements.download.href = String(data.downloadUrl);
          elements.download.textContent = 'Download ' + String(pack && pack.name ? pack.name : 'tone pack');
          elements.deliveryDetail.textContent = data.emailDelivery && data.emailDelivery.sent
            ? 'A delivery email was sent. You can also download the bundle here.'
            : 'The browser download is ready. Email delivery was attempted; use this button as the immediate fallback.';
          elements.checkout.disabled = true;
          elements.checkout.textContent = 'Pack delivered';
          setStatus('Verified delivery is ready.', 'success');
        }

        function requestBridge(method, params) {
          return new Promise(function (resolve, reject) {
            var id = 'tone-pack-' + String(++requestSequence);
            var timer = window.setTimeout(function () { pendingRequests.delete(id); reject(new Error('The app host did not answer in time.')); }, 8000);
            pendingRequests.set(id, { resolve: function (result) { window.clearTimeout(timer); resolve(result); }, reject: function (error) { window.clearTimeout(timer); reject(error); } });
            window.parent.postMessage({ jsonrpc: '2.0', id: id, method: method, params: params }, '*');
          });
        }

        function callServerTool(name, args) {
          if (window.openai && typeof window.openai.callTool === 'function') return window.openai.callTool(name, args || {});
          if (window.parent !== window) return requestBridge('tools/call', { name: name, arguments: args || {} });
          return Promise.reject(new Error('This card is waiting for a compatible app host.'));
        }

        function idempotencyKey() {
          if (window.crypto && typeof window.crypto.randomUUID === 'function') return 'tone-pack-' + window.crypto.randomUUID();
          return 'tone-pack-' + String(Date.now()) + '-' + Math.random().toString(36).slice(2, 12);
        }

        function handleCheckout() {
          if (elements.checkout.dataset.mode === 'delivery') {
            if (!checkoutSessionId) { setStatus('The checkout reference is missing. Start again from this card.', 'error'); return; }
            elements.checkout.disabled = true;
            setStatus('Verifying the completed checkout…', 'neutral');
            callServerTool('get_tone_pack_delivery', { slug: selectedSlug, checkoutSessionId: checkoutSessionId })
              .then(function (result) { hydratePack(result); })
              .catch(function () { setStatus('Payment could not be verified yet. Complete checkout, then try again.', 'error'); })
              .finally(function () { if (!elements.delivery.hidden) elements.checkout.disabled = true; else elements.checkout.disabled = false; });
            return;
          }
          var email = String(elements.email.value || '').trim();
          if (!email || !email.includes('@')) { setStatus('Enter the email where the pack should be delivered.', 'error'); elements.email.focus(); return; }
          if (!elements.confirmation.checked) { setStatus('Confirm the pack, price, and delivery email before checkout.', 'error'); return; }
          elements.checkout.disabled = true;
          setStatus('Creating your secure checkout…', 'neutral');
          callServerTool('create_tone_pack_checkout', { slug: selectedSlug, email: email, confirmed: true, idempotencyKey: idempotencyKey() })
            .then(function (result) { hydratePack(result); })
            .catch(function () { setStatus('Checkout could not be created. Please try again.', 'error'); })
            .finally(function () { if (elements.checkout.dataset.mode !== 'delivery') elements.checkout.disabled = false; });
        }

        PACKS.forEach(function (pack) {
          var option = document.createElement('option');
          option.value = pack.slug;
          option.textContent = String(pack.name) + ' · ' + String(pack.price || '$5.99');
          elements.select.appendChild(option);
        });
        elements.select.addEventListener('change', function () { selectedSlug = elements.select.value; renderPack(); });
        elements.checkout.addEventListener('click', handleCheckout);
        window.addEventListener('message', function (event) {
          if (event.source !== window.parent) return;
          var payload = event && event.data;
          if (!payload) return;
          if (payload.id && pendingRequests.has(payload.id)) {
            var pending = pendingRequests.get(payload.id);
            pendingRequests.delete(payload.id);
            if (payload.error) pending.reject(new Error(payload.error.message || 'Tool request failed.'));
            else pending.resolve(payload.result || payload);
            return;
          }
          if (payload.jsonrpc === '2.0' && payload.method === 'ui/notifications/tool-result') {
            hydratePack(payload.params && (payload.params.structuredContent || payload.params));
            return;
          }
          if (payload.type === 'ui/notifications/tool-result' || payload.type === 'openai/widget-output') hydratePack(payload.result || payload.output || payload);
        });

        var host = window.openai || {};
        hydratePack(host.toolInput || {});
        hydratePack(host.toolOutput || host.widgetOutput || {});
        renderPack();
      }());
    </script>
  </body>
</html>`;
