import {
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
      frameDomains: []
    }
  },
  'openai/widgetDescription': 'A click-through Cognistration science guide explaining the two-channel signal, FFR, descriptive frequency bands, evidence limits, and safe listening boundaries without starting audio.',
  'openai/widgetPrefersBorder': true,
  'openai/widgetDomain': 'https://cognistration.com',
  'openai/widgetCSP': {
    connect_domains: ['https://cognistration.com'],
    resource_domains: ['https://cognistration.com'],
    frame_domains: []
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
        background: var(--deep);
      }

      #ocean-canvas,
      .ocean-wash {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      #ocean-canvas { z-index: -3; display: block; }

      .ocean-wash {
        z-index: -2;
        pointer-events: none;
        background: linear-gradient(180deg, rgba(7, 22, 18, 0.25), rgba(7, 22, 18, 0.72));
        box-shadow: inset 0 0 120px rgba(3, 12, 9, 0.55);
      }

      .ocean-wash::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 20% 16%, rgba(182, 221, 204, 0.18), transparent 30%), radial-gradient(circle at 82% 80%, rgba(224, 180, 147, 0.13), transparent 32%);
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
      .session-strip,
      .slide-card {
        border: 1px solid var(--line);
        background: var(--glass);
        box-shadow: 0 26px 80px rgba(0, 0, 0, 0.24);
        backdrop-filter: blur(22px) saturate(125%);
        -webkit-backdrop-filter: blur(22px) saturate(125%);
      }

      .science-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 16px 18px;
        border-radius: 18px;
      }

      .topline-title {
        margin: 0;
        font-size: 17px;
        font-weight: 550;
        letter-spacing: -0.03em;
      }

      .topline-note {
        margin: 4px 0 0;
        color: var(--quiet);
        font-size: 12px;
      }

      .print-button,
      .nav-button {
        border: 1px solid rgba(242, 246, 242, 0.2);
        border-radius: 999px;
        color: var(--muted);
        background: rgba(242, 246, 242, 0.06);
        padding: 9px 13px;
        transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease, transform 160ms ease;
      }

      .print-button:hover,
      .nav-button:hover { border-color: rgba(182, 221, 204, 0.6); background: rgba(182, 221, 204, 0.1); color: var(--ink); }
      .print-button:active,
      .nav-button:active { transform: translateY(1px); }

      .session-strip {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 8px 18px;
        width: min(100%, 840px);
        margin: 22px auto 18px;
        padding: 12px 4px;
        border-width: 1px 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        color: var(--quiet);
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .session-strip strong { color: var(--mint); font-weight: 600; }
      .session-audio { color: rgba(182, 221, 204, 0.75); }

      .slide-card {
        width: min(100%, 840px);
        min-height: 330px;
        margin: 0 auto;
        padding: clamp(24px, 5vw, 48px);
        border-radius: 28px;
      }

      .slide-card h2 {
        max-width: 18ch;
        margin: 0;
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
        gap: 0;
        margin: 26px 0 0;
        border-top: 1px solid rgba(242, 246, 242, 0.12);
      }

      .fact,
      .band-row {
        display: grid;
        grid-template-columns: minmax(100px, 0.32fr) 1fr;
        gap: 14px;
        padding: 12px 0;
        border-bottom: 1px solid rgba(242, 246, 242, 0.12);
      }

      .fact strong,
      .band-row strong { color: var(--ink); font-size: 12px; font-weight: 650; }
      .fact span,
      .band-row span { color: var(--muted); font-size: 12px; line-height: 1.55; }

      .band-table { margin-top: 26px; border-top: 1px solid rgba(182, 221, 204, 0.35); }
      .band-row span:last-child { color: var(--mint); }

      .source-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 18px;
        margin: 28px 0 0;
        padding-top: 14px;
        border-top: 1px solid rgba(242, 246, 242, 0.12);
      }

      .source-list a {
        color: var(--muted);
        font-size: 12px;
        text-decoration: underline;
        text-decoration-color: rgba(242, 246, 242, 0.15);
        text-underline-offset: 4px;
      }

      .source-list a:hover { color: var(--mint); }

      .science-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        width: min(100%, 840px);
        margin: 18px auto 0;
        padding: 12px 0 0;
        border-top: 1px solid rgba(242, 246, 242, 0.12);
      }

      .slide-status { color: var(--quiet); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; }
      .slide-controls { display: flex; align-items: center; gap: 8px; }
      .nav-button:disabled { cursor: not-allowed; opacity: 0.35; }
      .dots { display: flex; align-items: center; gap: 5px; margin: 0 4px; }
      .dot { width: 6px; height: 6px; padding: 0; border: 0; border-radius: 50%; background: rgba(242, 246, 242, 0.26); }
      .dot[aria-selected="true"] { background: var(--mint); box-shadow: 0 0 0 3px rgba(182, 221, 204, 0.16); }

      @media (max-width: 640px) {
        .science-content { min-height: 760px; padding: 16px; }
        .science-topline { align-items: flex-start; flex-direction: column; }
        .science-topline .print-button { align-self: flex-start; }
        .slide-card { min-height: 390px; border-radius: 22px; padding: 24px; }
        .fact, .band-row { grid-template-columns: 1fr; gap: 5px; }
        .science-footer { align-items: flex-start; flex-direction: column; }
        .slide-controls { width: 100%; justify-content: space-between; }
      }

      @media print {
        #ocean-canvas, .ocean-wash { display: none; }
        .science-shell { background: #ffffff; color: #10221d; }
        .science-content { min-height: auto; }
        .science-topline, .session-strip, .slide-card, .science-footer { color: #10221d; background: #ffffff; box-shadow: none; }
        .slide-body, .fact span, .band-row span, .slide-status, .topline-note { color: #36534a; }
        .slide-controls, .print-button { display: none; }
      }

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
      }
    </style>
  </head>
  <body>
    <main class="science-shell" aria-labelledby="science-title">
      <canvas id="ocean-canvas" aria-hidden="true"></canvas>
      <div class="ocean-wash" aria-hidden="true"></div>
      <div class="science-content">
        <div class="science-topline">
          <div>
            <h1 class="topline-title" id="science-title">Understand the signal</h1>
            <p class="topline-note">Audio is off. Move through the guide at your pace.</p>
          </div>
          <button class="print-button" id="print-button" type="button">Print / save PDF</button>
        </div>

        <div class="session-strip" id="session-strip" aria-label="Current session settings">Direction <strong id="session-state">theta</strong> · Carrier <strong id="session-carrier">200 Hz</strong> · Difference <strong id="session-beat">6.0 Hz</strong> · <span class="session-audio">Audio off</span></div>

        <article class="slide-card" id="science-slide" tabindex="-1" aria-live="polite" aria-labelledby="slide-title">
          <h2 id="slide-title"></h2>
          <p class="slide-body" id="slide-body"></p>
          <div class="fact-list" id="fact-list"></div>
          <div class="band-table" id="band-table" hidden></div>
          <div class="source-list" id="source-list"></div>
        </article>

        <footer class="science-footer">
          <span class="slide-status" id="slide-status">Slide 01 / 07</span>
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
        var controls = { targetState: 'theta', carrierHz: 200, beatHz: 6 };
        var tone = null;
        var elements = {
          state: document.getElementById('session-state'),
          carrier: document.getElementById('session-carrier'),
          beat: document.getElementById('session-beat'),
          title: document.getElementById('slide-title'),
          body: document.getElementById('slide-body'),
          facts: document.getElementById('fact-list'),
          bands: document.getElementById('band-table'),
          sources: document.getElementById('source-list'),
          status: document.getElementById('slide-status'),
          previous: document.getElementById('previous'),
          next: document.getElementById('next'),
          dots: document.getElementById('dots'),
          card: document.getElementById('science-slide')
        };

        var oceanCanvas = document.getElementById('ocean-canvas');
        var oceanContext = oceanCanvas && oceanCanvas.getContext('2d');
        var oceanWidth = 0;
        var oceanHeight = 0;
        var oceanAnimationFrame = 0;
        var oceanDisposed = false;
        var oceanMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

        function resizeOcean() {
          if (!oceanCanvas || !oceanContext) return;
          var bounds = oceanCanvas.getBoundingClientRect();
          oceanWidth = Math.max(1, bounds.width);
          oceanHeight = Math.max(1, bounds.height);
          var ratio = Math.min(window.devicePixelRatio || 1, 2);
          oceanCanvas.width = Math.floor(oceanWidth * ratio);
          oceanCanvas.height = Math.floor(oceanHeight * ratio);
          oceanContext.setTransform(ratio, 0, 0, ratio, 0, 0);
        }

        function drawOcean(timestamp) {
          if (!oceanContext || !oceanWidth || !oceanHeight) return;
          var time = (timestamp || 0) * 0.00024;
          var horizon = oceanHeight * 0.34;
          var sky = oceanContext.createLinearGradient(0, 0, 0, oceanHeight);
          sky.addColorStop(0, '#102923');
          sky.addColorStop(0.35, '#1c473d');
          sky.addColorStop(0.56, '#1e594c');
          sky.addColorStop(1, '#0b2421');
          oceanContext.fillStyle = sky;
          oceanContext.fillRect(0, 0, oceanWidth, oceanHeight);

          var glow = oceanContext.createRadialGradient(oceanWidth * 0.52, horizon, 0, oceanWidth * 0.52, horizon, oceanWidth * 0.62);
          glow.addColorStop(0, 'rgba(188, 232, 211, 0.32)');
          glow.addColorStop(0.35, 'rgba(119, 196, 170, 0.13)');
          glow.addColorStop(1, 'rgba(119, 196, 170, 0)');
          oceanContext.fillStyle = glow;
          oceanContext.fillRect(0, 0, oceanWidth, oceanHeight);

          oceanContext.save();
          oceanContext.globalCompositeOperation = 'screen';
          for (var layer = 0; layer < 9; layer += 1) {
            var depth = layer / 8;
            var baseline = horizon + oceanHeight * (0.035 + depth * 0.62);
            var amplitude = 3 + (1 - depth) * Math.min(16, oceanHeight * 0.035);
            var wavelength = 120 + depth * 170;
            var speed = 0.52 + depth * 0.48;
            oceanContext.beginPath();
            for (var x = -24; x <= oceanWidth + 24; x += 10) {
              var primary = Math.sin(x / wavelength + time * speed + layer * 0.72) * amplitude;
              var secondary = Math.sin(x / (wavelength * 0.47) - time * (speed * 0.7) + layer) * amplitude * 0.28;
              var y = baseline + primary + secondary;
              if (x === -24) oceanContext.moveTo(x, y);
              else oceanContext.lineTo(x, y);
            }
            oceanContext.strokeStyle = 'rgba(190, 235, 216, ' + String(0.2 - depth * 0.012) + ')';
            oceanContext.lineWidth = depth < 0.45 ? 1.15 : 0.75;
            oceanContext.stroke();
          }

          for (var shimmer = 0; shimmer < 24; shimmer += 1) {
            var shimmerX = ((shimmer * 97) % 113) / 113 * oceanWidth;
            var drift = Math.sin(time * 0.8 + shimmer * 1.9) * 22;
            var shimmerY = horizon + oceanHeight * (0.12 + ((shimmer * 0.071) % 0.62));
            var length = 5 + ((shimmer * 13) % 18);
            oceanContext.beginPath();
            oceanContext.moveTo(shimmerX + drift, shimmerY);
            oceanContext.lineTo(shimmerX + drift + 2, shimmerY + length);
            oceanContext.strokeStyle = 'rgba(216, 245, 230, ' + String(0.035 + ((shimmer % 4) * 0.012)) + ')';
            oceanContext.lineWidth = 1;
            oceanContext.stroke();
          }
          oceanContext.restore();

          var vignette = oceanContext.createRadialGradient(oceanWidth * 0.5, oceanHeight * 0.4, oceanHeight * 0.12, oceanWidth * 0.5, oceanHeight * 0.45, Math.max(oceanWidth, oceanHeight) * 0.75);
          vignette.addColorStop(0, 'rgba(5, 18, 15, 0)');
          vignette.addColorStop(1, 'rgba(4, 15, 13, 0.52)');
          oceanContext.fillStyle = vignette;
          oceanContext.fillRect(0, 0, oceanWidth, oceanHeight);
        }

        function animateOcean(timestamp) {
          drawOcean(timestamp);
          if (!oceanDisposed && !oceanMotion?.matches) oceanAnimationFrame = window.requestAnimationFrame(animateOcean);
        }

        function restartOcean() {
          window.cancelAnimationFrame(oceanAnimationFrame);
          drawOcean(performance.now());
          if (!oceanDisposed && !oceanMotion?.matches) oceanAnimationFrame = window.requestAnimationFrame(animateOcean);
        }

        resizeOcean();
        restartOcean();
        window.addEventListener('resize', resizeOcean);
        if (oceanMotion?.addEventListener) oceanMotion.addEventListener('change', restartOcean);
        else oceanMotion?.addListener?.(restartOcean);

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
          elements.carrier.textContent = String(Math.round(Number(controls.carrierHz || tone?.baseFreqHz || 200))) + ' Hz';
          elements.beat.textContent = String(Number(controls.beatHz || tone?.targetHz || 6).toFixed(1)) + ' Hz';
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
            link.textContent = source.label;
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
          elements.title.textContent = String(slide.title || 'Science guide');
          elements.body.textContent = String(slide.body || '');
          elements.status.textContent = 'Slide ' + String(index + 1).padStart(2, '0') + ' / ' + String(SLIDES.length).padStart(2, '0');
          elements.previous.disabled = index === 0;
          elements.next.disabled = index === SLIDES.length - 1;
          elements.card.setAttribute('aria-label', 'Slide ' + String(index + 1) + ' of ' + String(SLIDES.length) + ': ' + String(slide.title || 'Science guide'));
          renderFacts(slide);
          renderBands(slide);
          renderSources(slide);
          renderDots();
        }

        function setIndex(nextIndex) {
          index = Math.min(SLIDES.length - 1, Math.max(0, nextIndex));
          render();
          if (elements.card && typeof elements.card.focus === 'function') elements.card.focus({ preventScroll: true });
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

        window.addEventListener('unload', function () {
          oceanDisposed = true;
          window.cancelAnimationFrame(oceanAnimationFrame);
          window.removeEventListener('resize', resizeOcean);
          if (oceanMotion?.removeEventListener) oceanMotion.removeEventListener('change', restartOcean);
          else oceanMotion?.removeListener?.(restartOcean);
        });
      }());
    </script>
  </body>
</html>`;
