import {
  SCIENCE_GUIDE_BACKGROUND_URL,
  SCIENCE_GUIDE_RESOURCE_MIME_TYPE,
  SCIENCE_GUIDE_RESOURCE_URI,
  SCIENCE_GUIDE_SLIDES,
  SCIENCE_GUIDE_SOURCES
} from './science-content.js';

export const SCIENCE_GUIDE_WIDGET_RESOURCE_META = {
  ui: {
    prefersBorder: true,
    domain: 'https://cognistration.com',
    csp: {
      connectDomains: ['https://cognistration.com'],
      resourceDomains: ['https://cognistration.com'],
      frameDomains: ['https://vgpu.sh']
    }
  },
  'openai/widgetDescription': 'A click-through Cognistration science guide explaining the two-channel signal, FFR, descriptive frequency bands, evidence limits, and safe listening boundaries without starting audio.',
  'openai/widgetPrefersBorder': true,
  'openai/widgetDomain': 'https://cognistration.com',
  'openai/widgetCSP': {
    connect_domains: ['https://cognistration.com'],
    resource_domains: ['https://cognistration.com'],
    frame_domains: ['https://vgpu.sh']
  }
};

const serializedSlides = JSON.stringify(SCIENCE_GUIDE_SLIDES);
const serializedSources = JSON.stringify(SCIENCE_GUIDE_SOURCES);

export const SCIENCE_GUIDE_WIDGET_HTML = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cognistration science guide</title>
    <style>
      :root {
        color-scheme: dark;
        --ink: #f2f6f2;
        --muted: rgba(242, 246, 242, 0.68);
        --quiet: rgba(242, 246, 242, 0.44);
        --line: rgba(242, 246, 242, 0.17);
        --glass: rgba(18, 36, 31, 0.72);
        --mint: #b6ddcc;
        --peach: #e0b493;
        --deep: #10221d;
      }

      * { box-sizing: border-box; }
      html, body { min-height: 100%; }
      body {
        margin: 0;
        background: var(--deep);
        color: var(--ink);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      button, a { font: inherit; }
      button { cursor: pointer; }
      button:focus-visible, a:focus-visible { outline: 2px solid var(--mint); outline-offset: 3px; }

      .science-shell {
        position: relative;
        isolation: isolate;
        min-height: 700px;
        overflow: hidden;
        background: #10221d;
      }

      .ocean-frame,
      .ocean-fallback,
      .ocean-wash {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }

      .ocean-frame {
        z-index: -3;
        pointer-events: none;
        opacity: 0.76;
      }

      .ocean-fallback {
        z-index: -4;
        overflow: hidden;
        background: #10221d;
      }

      .ocean-fallback::before,
      .ocean-fallback::after {
        content: "";
        position: absolute;
        width: 46vw;
        height: 46vw;
        min-width: 260px;
        min-height: 260px;
        border-radius: 50%;
        filter: blur(34px);
        opacity: 0.45;
        transform: translate3d(0, 0, 0);
        animation: float-orb 16s ease-in-out infinite alternate;
      }

      .ocean-fallback::before { left: -13%; top: 12%; background: #3e8b77; }
      .ocean-fallback::after { right: -16%; bottom: -10%; background: #ae846a; animation-delay: -6s; }

      .ocean-wash { z-index: -2; background: rgba(9, 25, 20, 0.58); }
      .ocean-wash::after {
        content: "";
        position: absolute;
        inset: 0;
        background: rgba(7, 16, 13, 0.28);
        box-shadow: inset 0 0 120px rgba(3, 12, 9, 0.62);
      }

      .science-content {
        position: relative;
        z-index: 1;
        display: flex;
        min-height: 700px;
        flex-direction: column;
        padding: 30px;
      }

      .science-topline,
      .science-footer,
      .session-strip,
      .slide-card {
        border: 1px solid var(--line);
        background: var(--glass);
        box-shadow: 0 26px 80px rgba(0, 0, 0, 0.24);
        backdrop-filter: blur(22px) saturate(125%);
        -webkit-backdrop-filter: blur(22px) saturate(125%);
      }

      .science-topline,
      .science-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 16px;
        border-radius: 18px;
      }

      .eyebrow {
        margin: 0;
        color: var(--mint);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.2em;
        line-height: 1.4;
        text-transform: uppercase;
      }

      .quiet-button,
      .nav-button,
      .print-button {
        border: 1px solid rgba(242, 246, 242, 0.2);
        border-radius: 999px;
        color: var(--muted);
        background: rgba(242, 246, 242, 0.06);
        padding: 9px 13px;
        transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease, transform 160ms ease;
      }

      .quiet-button:hover,
      .nav-button:hover,
      .print-button:hover { border-color: rgba(182, 221, 204, 0.6); background: rgba(182, 221, 204, 0.1); color: var(--ink); }
      .quiet-button:active,
      .nav-button:active,
      .print-button:active { transform: translateY(1px); }

      .science-intro {
        max-width: 660px;
        margin: auto auto 18px;
        padding: 34px 8px 0;
        text-align: center;
      }

      .science-intro h1 {
        max-width: 12ch;
        margin: 14px auto 0;
        font-size: clamp(38px, 7vw, 70px);
        font-weight: 500;
        letter-spacing: -0.07em;
        line-height: 0.98;
      }

      .science-intro p {
        max-width: 620px;
        margin: 18px auto 0;
        color: var(--muted);
        font-size: 15px;
        line-height: 1.75;
      }

      .session-strip {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 8px 18px;
        margin: 0 auto 18px;
        padding: 12px 16px;
        border-radius: 16px;
        color: var(--quiet);
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .session-strip strong { color: var(--mint); font-weight: 600; }

      .slide-card {
        width: min(100%, 840px);
        min-height: 330px;
        margin: 0 auto;
        padding: clamp(24px, 5vw, 48px);
        border-radius: 28px;
      }

      .slide-card h2 {
        max-width: 18ch;
        margin: 12px 0 0;
        font-size: clamp(28px, 5vw, 52px);
        font-weight: 500;
        letter-spacing: -0.06em;
        line-height: 1.02;
      }

      .slide-body {
        max-width: 720px;
        margin: 20px 0 0;
        color: var(--muted);
        font-size: 16px;
        line-height: 1.75;
      }

      .fact-list {
        display: grid;
        gap: 10px;
        margin: 26px 0 0;
      }

      .fact,
      .band-row {
        display: grid;
        grid-template-columns: minmax(100px, 0.32fr) 1fr;
        gap: 14px;
        padding: 12px 0;
        border-top: 1px solid rgba(242, 246, 242, 0.12);
      }

      .fact strong,
      .band-row strong { color: var(--ink); font-size: 12px; font-weight: 650; }
      .fact span,
      .band-row span { color: var(--muted); font-size: 12px; line-height: 1.55; }

      .band-table { margin-top: 26px; }
      .band-table .band-row:first-child { border-top-color: rgba(182, 221, 204, 0.35); }
      .band-row span:last-child { color: var(--mint); }

      .source-list {
        display: grid;
        gap: 8px;
        margin: 28px 0 0;
      }

      .source-list a {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 18px;
        border-bottom: 1px solid rgba(242, 246, 242, 0.1);
        padding: 10px 0;
        color: var(--muted);
        font-size: 12px;
        text-decoration: none;
      }

      .source-list a:hover { color: var(--mint); }
      .source-list small { color: var(--quiet); font-size: 10px; white-space: nowrap; }

      .science-footer {
        width: min(100%, 840px);
        margin: 18px auto 0;
        padding: 12px 14px;
      }

      .slide-status { color: var(--quiet); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; }
      .slide-controls { display: flex; align-items: center; gap: 8px; }
      .nav-button:disabled { cursor: not-allowed; opacity: 0.35; }
      .dots { display: flex; align-items: center; gap: 5px; margin: 0 4px; }
      .dot { width: 6px; height: 6px; padding: 0; border: 0; border-radius: 50%; background: rgba(242, 246, 242, 0.26); }
      .dot[aria-selected="true"] { background: var(--mint); box-shadow: 0 0 0 3px rgba(182, 221, 204, 0.16); }

      @keyframes float-orb {
        from { transform: translate3d(-3%, -2%, 0) scale(0.96); }
        to { transform: translate3d(5%, 4%, 0) scale(1.06); }
      }

      @media (max-width: 640px) {
        .science-content { min-height: 760px; padding: 16px; }
        .science-topline { align-items: flex-start; flex-direction: column; }
        .science-intro { padding-top: 28px; }
        .science-intro h1 { font-size: 44px; }
        .slide-card { min-height: 390px; border-radius: 22px; padding: 24px; }
        .fact, .band-row { grid-template-columns: 1fr; gap: 5px; }
        .science-footer { align-items: flex-start; flex-direction: column; }
        .slide-controls { width: 100%; justify-content: space-between; }
      }

      @media print {
        .ocean-frame, .ocean-fallback, .ocean-wash { display: none; }
        .science-shell { background: #ffffff; color: #10221d; }
        .science-content { min-height: auto; }
        .science-topline, .session-strip, .slide-card, .science-footer { color: #10221d; background: #ffffff; box-shadow: none; }
        .slide-body, .fact span, .band-row span, .slide-status { color: #36534a; }
        .slide-controls, .print-button { display: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
      }
    </style>
  </head>
  <body>
    <main class="science-shell" aria-labelledby="science-title">
      <div class="ocean-fallback" aria-hidden="true"></div>
      <iframe class="ocean-frame" src="${SCIENCE_GUIDE_BACKGROUND_URL}" title="FFT ocean surface visual background" tabindex="-1" sandbox="allow-scripts allow-same-origin"></iframe>
      <div class="ocean-wash" aria-hidden="true"></div>
      <div class="science-content">
        <div class="science-topline">
          <p class="eyebrow">Cognistration · signal notes</p>
          <button class="print-button" id="print-button" type="button">Print / save PDF</button>
        </div>

        <header class="science-intro">
          <p class="eyebrow">A calm technical walkthrough</p>
          <h1 id="science-title">Understand the signal before you listen.</h1>
          <p>This guide explains the language behind the generated tone, what FFR measures, where the evidence stops, and how to keep the preview voluntary.</p>
        </header>

        <div class="session-strip" id="session-strip" aria-label="Current session settings">Current session · <strong id="session-state">theta</strong> · <strong id="session-carrier">200 Hz carrier</strong> · <strong id="session-beat">6 Hz difference</strong> · audio off</div>

        <article class="slide-card" id="science-slide" aria-live="polite" aria-labelledby="slide-title">
          <p class="eyebrow" id="slide-eyebrow"></p>
          <h2 id="slide-title"></h2>
          <p class="slide-body" id="slide-body"></p>
          <div class="fact-list" id="fact-list"></div>
          <div class="band-table" id="band-table" hidden></div>
          <div class="source-list" id="source-list"></div>
        </article>

        <footer class="science-footer">
          <span class="slide-status" id="slide-status">01 / 07</span>
          <div class="slide-controls" aria-label="Science guide navigation">
            <button class="nav-button" id="previous" type="button">Previous</button>
            <div class="dots" id="dots" role="tablist" aria-label="Choose science guide slide"></div>
            <button class="nav-button" id="next" type="button">Next</button>
          </div>
        </footer>
      </div>
    </main>
    <script>
      (function () {
        var SLIDES = ${serializedSlides};
        var SOURCES = ${serializedSources};
        var sourceMap = {};
        SOURCES.forEach(function (source) { sourceMap[source.id] = source; });
        var index = 0;
        var controls = { targetState: 'theta', carrierHz: 200, beatHz: 6, volume: 72 };
        var tone = null;
        var elements = {
          state: document.getElementById('session-state'),
          carrier: document.getElementById('session-carrier'),
          beat: document.getElementById('session-beat'),
          eyebrow: document.getElementById('slide-eyebrow'),
          title: document.getElementById('slide-title'),
          body: document.getElementById('slide-body'),
          facts: document.getElementById('fact-list'),
          bands: document.getElementById('band-table'),
          sources: document.getElementById('source-list'),
          status: document.getElementById('slide-status'),
          previous: document.getElementById('previous'),
          next: document.getElementById('next'),
          dots: document.getElementById('dots')
        };

        function asObject(value) {
          if (!value) return {};
          if (typeof value === 'string') {
            try { return JSON.parse(value); } catch { return {}; }
          }
          if (value.structuredContent) return asObject(value.structuredContent);
          if (value.result) return asObject(value.result);
          return value;
        }

        function hydrate(value) {
          var data = asObject(value);
          if (data.controls && typeof data.controls === 'object') controls = Object.assign({}, controls, data.controls);
          if (data.tone && typeof data.tone === 'object') tone = data.tone;
          if (Array.isArray(data.slides) && data.slides.length) SLIDES = data.slides;
          renderSession();
        }

        function renderSession() {
          elements.state.textContent = String(controls.targetState || tone?.state || 'theta');
          elements.carrier.textContent = String(Math.round(Number(controls.carrierHz || tone?.baseFreqHz || 200))) + ' Hz carrier';
          elements.beat.textContent = String(Number(controls.beatHz || tone?.targetHz || 6).toFixed(1)) + ' Hz difference';
        }

        function addText(parent, tag, className, value) {
          var node = document.createElement(tag);
          if (className) node.className = className;
          node.textContent = String(value || '');
          parent.appendChild(node);
          return node;
        }

        function renderFacts(slide) {
          elements.facts.replaceChildren();
          (Array.isArray(slide.facts) ? slide.facts : []).forEach(function (fact) {
            var row = document.createElement('div');
            row.className = 'fact';
            addText(row, 'strong', '', fact.label);
            addText(row, 'span', '', fact.detail);
            elements.facts.appendChild(row);
          });
          elements.facts.hidden = !elements.facts.children.length;
        }

        function renderBands(slide) {
          elements.bands.replaceChildren();
          (Array.isArray(slide.bands) ? slide.bands : []).forEach(function (band) {
            var row = document.createElement('div');
            row.className = 'band-row';
            addText(row, 'strong', '', String(band.label || '') + ' · ' + String(band.range || ''));
            addText(row, 'span', '', band.direction);
            elements.bands.appendChild(row);
          });
          elements.bands.hidden = !elements.bands.children.length;
        }

        function renderSources(slide) {
          elements.sources.replaceChildren();
          (Array.isArray(slide.sourceIds) ? slide.sourceIds : []).forEach(function (id) {
            var source = sourceMap[id];
            if (!source) return;
            var link = document.createElement('a');
            link.href = source.url;
            link.target = '_blank';
            link.rel = 'noreferrer';
            addText(link, 'span', '', source.label);
            addText(link, 'small', '', source.kind);
            elements.sources.appendChild(link);
          });
          elements.sources.hidden = !elements.sources.children.length;
        }

        function renderDots() {
          elements.dots.replaceChildren();
          SLIDES.forEach(function (slide, slideIndex) {
            var dot = document.createElement('button');
            dot.className = 'dot';
            dot.type = 'button';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Open slide ' + String(slideIndex + 1));
            dot.setAttribute('aria-selected', slideIndex === index ? 'true' : 'false');
            dot.addEventListener('click', function () { setIndex(slideIndex); });
            elements.dots.appendChild(dot);
          });
        }

        function render() {
          var slide = SLIDES[index] || SLIDES[0];
          if (!slide) return;
          elements.eyebrow.textContent = String(slide.eyebrow || 'Cognistration science guide');
          elements.title.textContent = String(slide.title || 'Science guide');
          elements.body.textContent = String(slide.body || '');
          elements.status.textContent = String(String(index + 1).padStart(2, '0')) + ' / ' + String(SLIDES.length).padStart(2, '0');
          elements.previous.disabled = index === 0;
          elements.next.disabled = index === SLIDES.length - 1;
          renderFacts(slide);
          renderBands(slide);
          renderSources(slide);
          renderDots();
        }

        function setIndex(nextIndex) {
          index = Math.min(SLIDES.length - 1, Math.max(0, nextIndex));
          render();
          var card = document.getElementById('science-slide');
          if (card && typeof card.focus === 'function') card.focus({ preventScroll: true });
        }

        elements.previous.addEventListener('click', function () { setIndex(index - 1); });
        elements.next.addEventListener('click', function () { setIndex(index + 1); });
        document.getElementById('print-button').addEventListener('click', function () { window.print(); });
        document.addEventListener('keydown', function (event) {
          if (event.key === 'ArrowLeft') setIndex(index - 1);
          if (event.key === 'ArrowRight') setIndex(index + 1);
        });

        window.addEventListener('message', function (event) {
          var payload = event && event.data;
          if (!payload) return;
          if (payload.type === 'ui/notifications/tool-result' || payload.type === 'openai/widget-output') {
            hydrate(payload.result || payload.output || payload);
            render();
          }
        });

        var host = window.openai || {};
        hydrate(host.toolOutput || host.widgetOutput || host.widgetState || {});
        render();
      }());
    </script>
  </body>
</html>`;
