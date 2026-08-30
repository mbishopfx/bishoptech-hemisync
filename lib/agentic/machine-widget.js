export const MACHINE_WIDGET_HTML = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cognistration tone machine</title>
    <style>
      :root {
        color-scheme: dark;
        --ink: #f4f7f4;
        --muted: rgba(232, 242, 236, .62);
        --soft: rgba(232, 242, 236, .38);
        --line: rgba(226, 243, 235, .13);
        --panel: rgba(11, 25, 22, .76);
        --panel-soft: rgba(255, 255, 255, .055);
        --mint: #b6ddcc;
        --peach: #d7c7aa;
        --lavender: #d7eadf;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      * { box-sizing: border-box; }
      html, body { margin: 0; min-height: 100%; background: #091612; }
      body { color: var(--ink); }
      button, input { font: inherit; }
      button { color: inherit; }
      button:focus-visible, input:focus-visible { outline: 2px solid var(--mint); outline-offset: 3px; }
      .machine-shell { position: relative; isolation: isolate; overflow: hidden; max-width: 920px; margin: 0 auto; padding: 20px; background: linear-gradient(145deg, #122a24 0%, #0c1d19 48%, #121621 100%); }
      .aurora-frame { position: absolute; z-index: -3; inset: 0; width: 100%; height: 100%; border: 0; opacity: .42; mix-blend-mode: screen; pointer-events: none; }
      .machine-shell::before, .machine-shell::after { content: ""; position: absolute; z-index: -2; border-radius: 999px; filter: blur(30px); opacity: .7; pointer-events: none; }
      .machine-shell::before { width: 46%; height: 45%; top: -12%; left: 8%; background: radial-gradient(circle, rgba(162, 231, 200, .42), rgba(162, 231, 200, 0) 70%); animation: drift-one 13s ease-in-out infinite alternate; }
      .machine-shell::after { width: 42%; height: 52%; right: -10%; bottom: -22%; background: radial-gradient(circle, rgba(189, 171, 231, .34), rgba(189, 171, 231, 0) 70%); animation: drift-two 16s ease-in-out infinite alternate; }
      .aurora-ribbon { position: absolute; z-index: -1; width: 72%; height: 34%; left: 18%; top: 17%; border-radius: 50%; background: linear-gradient(100deg, rgba(195, 231, 211, .18), rgba(218, 192, 169, .10), rgba(191, 177, 231, .13)); filter: blur(34px); transform: rotate(-8deg); animation: ribbon 12s ease-in-out infinite alternate; pointer-events: none; }
      @keyframes drift-one { to { transform: translate(22%, 18%) scale(1.18); } }
      @keyframes drift-two { to { transform: translate(-18%, -22%) scale(1.2); } }
      @keyframes ribbon { to { transform: translate(-4%, 12%) rotate(10deg) scale(1.1); opacity: .7; } }
      @media (prefers-reduced-motion: reduce) { .machine-shell::before, .machine-shell::after, .aurora-ribbon { animation: none; } }

      .machine-header, .machine-footer, .machine-actions, .status-row, .field-heading, .tone-meta, .pack-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .machine-header { min-height: 34px; }
      .brand { display: inline-flex; align-items: center; gap: 9px; font-size: 12px; font-weight: 650; letter-spacing: .02em; }
      .brand-mark { display: inline-block; width: 9px; height: 9px; border: 1px solid var(--mint); border-radius: 50%; box-shadow: 0 0 16px rgba(199, 232, 216, .6); }
      .header-button, .secondary-button { border: 1px solid var(--line); border-radius: 999px; background: rgba(255,255,255,.04); color: var(--muted); padding: 8px 12px; cursor: pointer; transition: background .2s ease, border-color .2s ease, color .2s ease, transform .2s ease; }
      .header-button:hover, .secondary-button:hover { border-color: rgba(226,243,235,.28); background: rgba(255,255,255,.09); color: var(--ink); transform: translateY(-1px); }
      .hero { max-width: 680px; padding: 54px 0 34px; }
      h1 { max-width: 620px; margin: 0; font-size: clamp(36px, 7vw, 68px); line-height: .98; letter-spacing: -.065em; font-weight: 560; }
      .hero-copy { max-width: 580px; margin: 17px 0 0; color: var(--muted); font-size: 16px; line-height: 1.65; }
      .intention-form { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin-top: 27px; }
      .text-input { width: 100%; min-width: 0; border: 1px solid var(--line); border-radius: 14px; background: rgba(3, 12, 10, .5); color: var(--ink); padding: 14px 15px; }
      .text-input::placeholder { color: rgba(232, 242, 236, .34); }
      .primary-button { border: 0; border-radius: 14px; background: var(--mint); color: #122c24; padding: 0 18px; font-weight: 650; cursor: pointer; transition: transform .2s ease, filter .2s ease; }
      .primary-button:hover { filter: brightness(1.08); transform: translateY(-1px); }
      .status-row { min-height: 24px; margin: 4px 0 18px; color: var(--soft); font-size: 12px; }
      .status-row[data-kind="success"] { color: var(--mint); }
      .status-row[data-kind="error"] { color: #f2b9a5; }
      .status-dot { width: 7px; height: 7px; flex: 0 0 auto; border-radius: 50%; background: var(--mint); box-shadow: 0 0 12px rgba(199,232,216,.8); }
      .status-message { display: inline-flex; align-items: center; gap: 8px; }
      .section-label { margin: 0 0 11px; color: var(--soft); font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
      .machine-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(260px, .85fr); gap: 12px; }
      .panel { border: 1px solid var(--line); border-radius: 22px; background: var(--panel); backdrop-filter: blur(16px); }
      .signal-panel { min-height: 300px; padding: 21px; }
      .signal-visual { position: relative; min-height: 238px; overflow: hidden; border: 1px solid rgba(226,243,235,.09); border-radius: 16px; background: rgba(2, 12, 10, .48); padding: 16px; }
      .signal-visual::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 50% 52%, rgba(182,221,204,.08), transparent 58%); pointer-events: none; }
      .frequency-stage { position: absolute; inset: 10px 14px; display: block; width: calc(100% - 28px); height: calc(100% - 20px); transform-origin: center; animation: frequency-breathe 8s ease-in-out infinite; }
      .frequency-wave { fill: none; stroke-linecap: round; vector-effect: non-scaling-stroke; }
      .frequency-wave-left { color: var(--mint); opacity: .82; stroke: currentColor; stroke-width: 1.5; }
      .frequency-wave-right { color: var(--peach); opacity: .74; stroke: currentColor; stroke-width: 1.5; }
      .frequency-wave-beat { color: var(--lavender); opacity: .9; stroke: currentColor; stroke-width: 2.5; filter: url(#machine-glow-wave); }
      .frequency-divider { stroke: rgba(226,243,235,.12); stroke-width: 1; vector-effect: non-scaling-stroke; }
      @keyframes frequency-breathe { 50% { transform: scaleY(1.025); opacity: .94; } }
      @media (prefers-reduced-motion: reduce) { .machine-shell::before, .machine-shell::after, .aurora-ribbon, .frequency-stage { animation: none; } }
      .wave-label { position: absolute; left: 16px; z-index: 1; color: var(--soft); font-size: 11px; }
      .wave-label.left { top: 17px; } .wave-label.right { top: 82px; } .wave-label.beat { bottom: 18px; }
      .wave-value { position: absolute; right: 16px; z-index: 1; color: var(--muted); font-size: 11px; }
      .wave-value.left { top: 17px; } .wave-value.right { top: 82px; } .wave-value.beat { bottom: 18px; }
      .controls-panel { padding: 21px; }
      .field { margin: 0 0 20px; }
      .field-heading { color: var(--muted); font-size: 13px; }
      .field-value { color: var(--ink); font-variant-numeric: tabular-nums; }
      input[type="range"] { width: 100%; height: 5px; margin: 11px 0 4px; accent-color: var(--mint); cursor: pointer; }
      .hint { display: block; color: var(--soft); font-size: 11px; line-height: 1.5; }
      .state-buttons { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-top: 9px; }
      .state-button { min-width: 0; border: 1px solid var(--line); border-radius: 10px; background: var(--panel-soft); color: var(--soft); padding: 9px 4px; font-size: 11px; cursor: pointer; transition: .2s ease; }
      .state-button:hover { color: var(--ink); border-color: rgba(226,243,235,.25); }
      .state-button[aria-pressed="true"] { border-color: rgba(199,232,216,.42); background: rgba(199,232,216,.12); color: var(--mint); }
      .quick-actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 17px; }
      .secondary-button { font-size: 11px; }
      .tone-card { margin-top: 12px; padding: 17px 19px; }
      .tone-name { margin: 0; font-size: 16px; font-weight: 650; letter-spacing: -.02em; }
      .tone-state { color: var(--mint); font-size: 11px; text-transform: capitalize; }
      .tone-summary { margin: 9px 0 0; color: var(--muted); font-size: 12px; line-height: 1.6; }
      .machine-actions { margin-top: 12px; }
      .play-button { flex: 1; min-height: 46px; border: 1px solid rgba(199,232,216,.3); border-radius: 14px; background: rgba(199,232,216,.12); color: var(--mint); font-weight: 650; cursor: pointer; transition: .2s ease; }
      .play-button:hover { background: rgba(199,232,216,.18); border-color: rgba(199,232,216,.55); }
      .play-button[data-playing="true"] { background: rgba(231,196,170,.14); border-color: rgba(231,196,170,.42); color: var(--peach); }
      .pack-panel { margin-top: 12px; padding: 19px; }
      .pack-heading h2 { margin: 0; font-size: 16px; font-weight: 650; letter-spacing: -.02em; }
      .pack-heading p { margin: 5px 0 0; color: var(--soft); font-size: 11px; line-height: 1.5; }
      .packs-button { flex: 0 0 auto; }
      .pack-list { display: grid; gap: 7px; margin-top: 14px; }
      .pack-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid rgba(226,243,235,.08); padding-top: 11px; }
      .pack-item strong { display: block; font-size: 12px; font-weight: 600; }
      .pack-item span { display: block; margin-top: 3px; color: var(--soft); font-size: 11px; }
      .pack-use { border: 0; border-bottom: 1px solid rgba(199,232,216,.45); background: transparent; color: var(--mint); padding: 3px 0; font-size: 11px; cursor: pointer; white-space: nowrap; }
      .pack-use:hover { border-color: var(--mint); }
      .guide-panel { margin-top: 12px; padding: 19px; }
      .guide-actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 14px; }
      .guide-output { margin-top: 14px; border-top: 1px solid rgba(226,243,235,.08); padding-top: 13px; }
      .guide-output h3 { margin: 0; font-size: 14px; font-weight: 650; }
      .guide-output p { margin: 5px 0 0; color: var(--muted); font-size: 12px; line-height: 1.55; }
      .guide-list { display: grid; gap: 8px; margin: 12px 0 0; padding: 0; list-style: none; }
      .guide-list li { border-left: 2px solid rgba(199,232,216,.32); padding-left: 10px; }
      .guide-list strong { display: block; font-size: 11px; font-weight: 650; }
      .guide-list span { display: block; margin-top: 3px; color: var(--soft); font-size: 11px; line-height: 1.45; }
      .guide-cue { margin-top: 12px; border-radius: 13px; background: rgba(199,232,216,.07); padding: 11px 12px; }
      .guide-cue strong { display: block; color: var(--mint); font-size: 11px; }
      .guide-cue span { display: block; margin-top: 5px; color: var(--muted); font-size: 12px; line-height: 1.5; }
      .comparison-grid { display: grid; gap: 7px; margin-top: 12px; }
      .comparison-item { border-top: 1px solid rgba(226,243,235,.08); padding-top: 9px; }
      .comparison-item strong { display: block; font-size: 12px; font-weight: 650; }
      .comparison-item span { display: block; margin-top: 3px; color: var(--soft); font-size: 11px; line-height: 1.45; }
      .calibration-panel { margin-top: 15px; border-top: 1px solid rgba(226,243,235,.08); padding-top: 14px; }
      .calibration-panel h3 { margin: 0; font-size: 12px; font-weight: 650; }
      .calibration-panel p { margin: 5px 0 0; color: var(--soft); font-size: 11px; line-height: 1.5; }
      .calibration-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
      .calibration-button { border: 1px solid rgba(226,243,235,.12); border-radius: 999px; background: rgba(255,255,255,.035); color: var(--muted); padding: 7px 10px; font-size: 10px; cursor: pointer; }
      .calibration-button:hover { border-color: rgba(199,232,216,.4); color: var(--mint); }
      .machine-footer { margin-top: 17px; color: rgba(232,242,236,.3); font-size: 10px; line-height: 1.5; }
      .machine-footer span:first-child { max-width: 68%; }
      .host-note { color: rgba(232,242,236,.42); }
      @media (max-width: 680px) {
        .machine-shell { padding: 16px; }
        .hero { padding-top: 42px; }
        .intention-form { grid-template-columns: 1fr; }
        .primary-button { min-height: 46px; }
        .machine-grid { grid-template-columns: 1fr; }
        .machine-footer { align-items: flex-start; flex-direction: column; }
        .machine-footer span:first-child { max-width: 100%; }
      }
    </style>
  </head>
  <body>
    <main class="machine-shell" data-machine-widget data-machine-widget-version="0.2.0">
      <iframe class="aurora-frame" src="https://cognistration.com/visuals/aurora-current.html?obs=1" title="" aria-hidden="true" tabindex="-1" sandbox="allow-scripts"></iframe>
      <div class="aurora-ribbon" aria-hidden="true"></div>
      <header class="machine-header">
        <div class="brand"><span class="brand-mark" aria-hidden="true"></span><span>Cognistration</span></div>
        <button class="header-button" id="expand-button" type="button">Open larger</button>
      </header>

      <section class="hero" aria-labelledby="machine-title">
        <h1 id="machine-title">Shape the next moment.</h1>
        <p class="hero-copy">Give the machine a direction, then tune a small listening session around the moment you are actually in.</p>
        <form class="intention-form" id="intention-form">
          <label class="sr-only" for="intention-input" style="position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0)">What do you want from this session?</label>
          <input class="text-input" id="intention-input" name="intention" maxlength="240" autocomplete="off" placeholder="e.g. clear my mind before I write">
          <button class="primary-button" type="submit">Find a tone</button>
        </form>
      </section>

      <div class="status-row" id="status-row" data-kind="neutral" aria-live="polite">
        <span class="status-message"><span class="status-dot" aria-hidden="true"></span><span id="status-message">Your machine is ready.</span></span>
        <span id="host-note" class="host-note"></span>
      </div>

      <section class="machine-grid" aria-label="Tone machine controls">
        <div class="panel signal-panel">
          <p class="section-label">Live shape</p>
          <div class="signal-visual" aria-label="Visual representation of the two channels and perceived rhythm">
            <span class="wave-label left">Left channel</span><span class="wave-value left" id="left-value">200 Hz</span>
            <span class="wave-label right">Right channel</span><span class="wave-value right" id="right-value">206 Hz</span>
            <span class="wave-label beat">Perceived rhythm</span><span class="wave-value beat" id="beat-value">6.0 Hz · theta</span>
            <svg class="frequency-stage" viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <filter id="machine-glow-wave">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"></feGaussianBlur>
                  <feMerge>
                    <feMergeNode in="coloredBlur"></feMergeNode>
                    <feMergeNode in="SourceGraphic"></feMergeNode>
                  </feMerge>
                </filter>
              </defs>
              <path class="frequency-divider" d="M 0 142 L 400 142"></path>
              <path id="left-wave-path" class="frequency-wave frequency-wave-left" d="M 0 40 L 400 40" transform="translate(0 14)"></path>
              <path id="right-wave-path" class="frequency-wave frequency-wave-right" d="M 0 40 L 400 40" transform="translate(0 82)"></path>
              <path id="beat-wave-path" class="frequency-wave frequency-wave-beat" d="M 0 50 L 400 50" transform="translate(0 148)"></path>
            </svg>
          </div>
          <div class="tone-card panel" id="tone-card">
            <div class="tone-meta"><p class="tone-name" id="tone-name">Balanced starting point</p><span class="tone-state" id="tone-state">theta</span></div>
            <p class="tone-summary" id="tone-summary">Choose a direction or describe what you need. The machine will keep you inside the public listening library.</p>
          </div>
        </div>

        <div class="panel controls-panel">
          <p class="section-label">Tune the session</p>
          <div class="field">
            <div class="field-heading"><span>Shared tone</span><span class="field-value" id="carrier-label">200 Hz</span></div>
            <input id="carrier-range" type="range" min="100" max="400" step="1" value="200" aria-label="Shared tone in hertz">
            <span class="hint">The carrier both channels receive.</span>
          </div>
          <div class="field">
            <div class="field-heading"><span>Rhythm</span><span class="field-value" id="rhythm-label">6.0 Hz</span></div>
            <input id="rhythm-range" type="range" min="0.5" max="40" step="0.5" value="6" aria-label="Rhythm in hertz">
            <span class="hint">The difference between the two channels.</span>
          </div>
          <div class="field">
            <div class="field-heading"><span>Volume</span><span class="field-value" id="volume-label">72%</span></div>
            <input id="volume-range" type="range" min="0" max="100" step="1" value="72" aria-label="Preview volume">
            <span class="hint">Start low and keep the level comfortable.</span>
          </div>
          <p class="section-label">Choose a direction</p>
          <div class="state-buttons" id="state-buttons" role="group" aria-label="Tone direction">
            <button class="state-button" type="button" data-state="delta" data-hz="3" aria-pressed="false">Delta</button>
            <button class="state-button" type="button" data-state="theta" data-hz="6" aria-pressed="true">Theta</button>
            <button class="state-button" type="button" data-state="alpha" data-hz="10" aria-pressed="false">Alpha</button>
            <button class="state-button" type="button" data-state="beta" data-hz="18" aria-pressed="false">Beta</button>
            <button class="state-button" type="button" data-state="gamma" data-hz="39.5" aria-pressed="false">Gamma</button>
          </div>
          <div class="quick-actions">
            <button class="secondary-button" id="gamma-preset" type="button">Gamma · 246 Hz</button>
            <button class="secondary-button" id="smaller-carrier" type="button">Make carrier smaller</button>
          </div>
        </div>
      </section>

      <div class="machine-actions">
        <button class="play-button" id="play-button" type="button" data-playing="false">Start explicit preview</button>
      </div>

      <section class="panel pack-panel" aria-labelledby="pack-title">
        <div class="pack-heading">
          <div><h2 id="pack-title">Try a finished direction</h2><p>Browse public packs when you want a longer arc than a single tone.</p></div>
          <button class="secondary-button packs-button" id="packs-button" type="button">Browse packs</button>
        </div>
        <div class="pack-list" id="pack-list" hidden></div>
      </section>

      <section class="panel guide-panel" aria-labelledby="guide-title">
        <div class="pack-heading">
          <div><h2 id="guide-title">Make it a session</h2><p>Use the direction above to build a simple arc, compare options, or get a short practice cue.</p></div>
        </div>
        <div class="guide-actions">
          <button class="secondary-button" id="clarify-button" type="button">Help me choose</button>
          <button class="secondary-button" id="plan-button" type="button">Plan 20 minutes</button>
          <button class="secondary-button" id="compare-button" type="button">Compare directions</button>
          <button class="secondary-button" id="cue-button" type="button">Give me a cue</button>
        </div>
        <div class="calibration-panel" aria-labelledby="calibration-title">
          <h3 id="calibration-title">Tune it by feel</h3>
          <p>After a preview, tell the machine what to change. It will adjust the visible controls without starting audio again.</p>
          <div class="calibration-actions" role="group" aria-label="Tone feedback">
            <button class="calibration-button" type="button" data-feedback="too_intense">Too intense</button>
            <button class="calibration-button" type="button" data-feedback="too_quiet">Too quiet</button>
            <button class="calibration-button" type="button" data-feedback="too_bright">Too bright</button>
            <button class="calibration-button" type="button" data-feedback="too_slow">Too slow</button>
            <button class="calibration-button" type="button" data-feedback="too_flat">Too flat</button>
            <button class="calibration-button" type="button" data-feedback="just_right">Just right</button>
          </div>
        </div>
        <div class="guide-output" id="guide-output" hidden></div>
      </section>

      <footer class="machine-footer">
        <span>Use headphones for the channel separation. This is a listening tool, not medical advice.</span>
        <span>Audio stays off until you press play.</span>
      </footer>
    </main>
    <script>
      (function () {
        'use strict';

        var STATES = { delta: 3, theta: 6, alpha: 10, beta: 18, gamma: 39.5 };
        var allowedStates = Object.keys(STATES);
        var defaults = { targetState: 'theta', carrierHz: 200, beatHz: 6, volume: 72, isPlaying: false, stateVersion: 1 };
        var state = Object.assign({}, defaults);
        var tone = null;
        var audioContext = null;
        var leftOscillator = null;
        var rightOscillator = null;
        var masterGain = null;
        var playing = false;
        var visualTime = 0;
        var visualFrame = null;
        var requestSequence = 0;
        var pendingRequests = new Map();
        var modelContextTimer = null;
        var lastAction = 'ready';
        var startPromise = null;
        var startAttempt = 0;
        var watchedAudioContext = null;

        var elements = {
          form: document.getElementById('intention-form'),
          intention: document.getElementById('intention-input'),
          statusRow: document.getElementById('status-row'),
          status: document.getElementById('status-message'),
          hostNote: document.getElementById('host-note'),
          toneName: document.getElementById('tone-name'),
          toneState: document.getElementById('tone-state'),
          toneSummary: document.getElementById('tone-summary'),
          carrierRange: document.getElementById('carrier-range'),
          rhythmRange: document.getElementById('rhythm-range'),
          volumeRange: document.getElementById('volume-range'),
          carrierLabel: document.getElementById('carrier-label'),
          rhythmLabel: document.getElementById('rhythm-label'),
          volumeLabel: document.getElementById('volume-label'),
          leftValue: document.getElementById('left-value'),
          rightValue: document.getElementById('right-value'),
          beatValue: document.getElementById('beat-value'),
          leftWave: document.getElementById('left-wave-path'),
          rightWave: document.getElementById('right-wave-path'),
          beatWave: document.getElementById('beat-wave-path'),
          play: document.getElementById('play-button'),
          packs: document.getElementById('packs-button'),
          packList: document.getElementById('pack-list'),
          plan: document.getElementById('plan-button'),
          compare: document.getElementById('compare-button'),
          cue: document.getElementById('cue-button'),
          clarify: document.getElementById('clarify-button'),
          guideOutput: document.getElementById('guide-output'),
          expand: document.getElementById('expand-button'),
          gamma: document.getElementById('gamma-preset'),
          smaller: document.getElementById('smaller-carrier')
        };

        function numberOr(value, fallback) {
          var number = Number(value);
          return Number.isFinite(number) ? number : fallback;
        }

        function clamp(value, minimum, maximum) {
          return Math.min(maximum, Math.max(minimum, value));
        }

        function round(value, digits) {
          var factor = Math.pow(10, digits || 0);
          return Math.round(value * factor) / factor;
        }

        function safeJson(value) {
          if (typeof value !== 'string') return value || null;
          try { return JSON.parse(value); } catch (error) { return null; }
        }

        function structuredContent(value) {
          var parsed = safeJson(value);
          if (!parsed) return null;
          if (parsed.structuredContent) return parsed.structuredContent;
          if (parsed.result && parsed.result.structuredContent) return parsed.result.structuredContent;
          return parsed;
        }

        function setStatus(message, kind) {
          elements.status.textContent = message;
          elements.statusRow.dataset.kind = kind || 'neutral';
        }

        function machineSnapshot() {
          var audioContextState = audioContext ? audioContext.state : 'not-created';
          return {
            targetState: state.targetState,
            carrierHz: state.carrierHz,
            beatHz: state.beatHz,
            volume: state.volume,
            isPlaying: playing,
            audioReady: playing && audioContextState === 'running',
            audioContextState: audioContextState,
            stateVersion: state.stateVersion,
            lastAction: lastAction
          };
        }

        function publishModelContext() {
          var snapshot = machineSnapshot();
          var playback = snapshot.isPlaying ? 'playing' : 'paused';
          var text = 'Current Cognistration machine state: ' + snapshot.targetState + ', carrier ' + snapshot.carrierHz + ' Hz, rhythm ' + snapshot.beatHz.toFixed(1) + ' Hz, volume ' + snapshot.volume + '%. Playback is ' + playback + ', audio context is ' + snapshot.audioContextState + ', and audioReady is ' + String(snapshot.audioReady) + '. The widget applies control changes live without pausing audio; state version ' + snapshot.stateVersion + '. If audioReady is false after a start request, ask the listener to press the visible Start preview button.';
          if (window.parent !== window) {
            window.parent.postMessage({
              jsonrpc: '2.0',
              method: 'ui/update-model-context',
              params: { content: [{ type: 'text', text: text }] }
            }, '*');
          }
        }

        function scheduleModelContextUpdate() {
          if (modelContextTimer !== null) window.clearTimeout(modelContextTimer);
          modelContextTimer = window.setTimeout(function () {
            modelContextTimer = null;
            publishModelContext();
          }, 80);
        }

        // Keep the app-host visual in step with the website ToneMachineDemo:
        // two fine carrier traces and one slower, enveloped rhythm trace.
        function getSinePath(freq, amplitude, speedMultiplier) {
          var points = [];
          var width = 400;
          var height = 80;
          var visualFreq = freq * .05;
          for (var x = 0; x <= width; x += 4) {
            var y = height / 2 + Math.sin((x * visualFreq * .5) - (visualTime * speedMultiplier * 1.5)) * amplitude;
            points.push(x + ',' + y.toFixed(2));
          }
          return 'M ' + points.join(' L ');
        }

        function getEntrainmentPath(freq, amplitude, speedMultiplier) {
          var points = [];
          var width = 400;
          var height = 100;
          for (var x = 0; x <= width; x += 4) {
            var envelope = Math.sin(x * .015);
            var y = height / 2 + Math.sin((x * freq * .08) - (visualTime * speedMultiplier * 1.2)) * amplitude * envelope;
            points.push(x + ',' + y.toFixed(2));
          }
          return 'M ' + points.join(' L ');
        }

        function renderWavePaths() {
          if (!elements.leftWave || !elements.rightWave || !elements.beatWave) return;
          elements.leftWave.setAttribute('d', getSinePath(state.carrierHz, playing ? 20 : .5, 1.2));
          elements.rightWave.setAttribute('d', getSinePath(state.carrierHz + state.beatHz, playing ? 20 : .5, 1.3));
          elements.beatWave.setAttribute('d', getEntrainmentPath(state.beatHz, playing ? 30 : 0, .4));
        }

        function animateWavePaths() {
          visualTime += .08;
          renderWavePaths();
          visualFrame = window.requestAnimationFrame(animateWavePaths);
        }

        function startWaveAnimation() {
          if (visualFrame === null && typeof window.requestAnimationFrame === 'function') {
            visualFrame = window.requestAnimationFrame(animateWavePaths);
          }
        }

        function stopWaveAnimation() {
          if (visualFrame !== null && typeof window.cancelAnimationFrame === 'function') {
            window.cancelAnimationFrame(visualFrame);
          }
          visualFrame = null;
          visualTime = 0;
          renderWavePaths();
        }

        function persistState() {
          var openai = window.openai;
          if (openai && typeof openai.setWidgetState === 'function') {
            openai.setWidgetState({
              targetState: state.targetState,
              carrierHz: state.carrierHz,
              beatHz: state.beatHz,
              volume: state.volume,
              stateVersion: state.stateVersion
            });
          }
          scheduleModelContextUpdate();
        }

        function applyControls(next) {
          if (!next || typeof next !== 'object') return;
          var requestedState = next.targetState || next.state;
          if (allowedStates.indexOf(requestedState) !== -1) state.targetState = requestedState;
          state.carrierHz = round(clamp(numberOr(next.carrierHz, state.carrierHz), 100, 400), 0);
          state.beatHz = round(clamp(numberOr(next.beatHz, state.beatHz), .5, 40), 1);
          state.volume = round(clamp(numberOr(next.volume, state.volume), 0, 100), 0);
          state.stateVersion = Math.max(1, numberOr(next.stateVersion, state.stateVersion) + 1);
          updateOscillators();
          render();
          scheduleModelContextUpdate();
        }

        function applyAdjustment(adjustment) {
          if (!adjustment || typeof adjustment !== 'object') return;
          var field = adjustment.field;
          if (field !== 'carrierHz' && field !== 'beatHz' && field !== 'volume') {
            if (adjustment.control === 'carrier') field = 'carrierHz';
            if (adjustment.control === 'rhythm') field = 'beatHz';
            if (adjustment.control === 'volume') field = 'volume';
          }
          if (!field || !Number.isFinite(Number(adjustment.delta))) return;
          var nextValue = numberOr(state[field], 0) + Number(adjustment.delta);
          var patch = {};
          patch[field] = nextValue;
          applyControls(patch);
        }

        function applyOutput(value, options) {
          var outputOptions = options || {};
          var data = structuredContent(value);
          if (!data || typeof data !== 'object') return;
          var startRequested = data.audioAction === 'start' && !outputOptions.skipAudioAction;
          var startAcknowledged = data.audioAction === 'start' && outputOptions.skipAudioAction;
          if (!outputOptions.skipControlChanges) {
            if (data.controls) applyControls(data.controls);
            if (data.controlPatch) applyControls(data.controlPatch);
            if (data.calibration && data.calibration.controls) applyControls(data.calibration.controls);
            if (data.adjustment && !data.controls && !data.controlPatch) applyAdjustment(data.adjustment);
          }
          if (data.tone && typeof data.tone === 'object') tone = data.tone;
          if (startRequested) {
            startAudio().then(function (started) {
              if (started) {
                if (data.message) setStatus(String(data.message), 'success');
              } else if (!data.error) {
                setStatus('The browser did not allow automatic audio. Press Start explicit preview to begin listening.', 'neutral');
              }
              render();
              scheduleModelContextUpdate();
            });
          }
          if (data.audioAction === 'stop' && !outputOptions.skipAudioAction) stopAudio();
          if (data.displayAction === 'fullscreen' && window.openai && typeof window.openai.requestDisplayMode === 'function') {
            window.openai.requestDisplayMode({ mode: 'fullscreen' }).catch(function () {});
          }
          if (data.message && !startRequested && !startAcknowledged) setStatus(String(data.message), 'success');
          if (data.error && data.error.safeMessage) setStatus(String(data.error.safeMessage), 'error');
          render();
          scheduleModelContextUpdate();
        }

        function render() {
          var right = state.carrierHz + state.beatHz;
          elements.carrierRange.value = String(state.carrierHz);
          elements.rhythmRange.value = String(state.beatHz);
          elements.volumeRange.value = String(state.volume);
          elements.carrierLabel.textContent = String(state.carrierHz) + ' Hz';
          elements.rhythmLabel.textContent = state.beatHz.toFixed(1) + ' Hz';
          elements.volumeLabel.textContent = String(state.volume) + '%';
          elements.leftValue.textContent = String(state.carrierHz) + ' Hz';
          elements.rightValue.textContent = String(round(right, 1)) + ' Hz';
          elements.beatValue.textContent = state.beatHz.toFixed(1) + ' Hz · ' + state.targetState;
          elements.toneState.textContent = state.targetState;
          elements.toneName.textContent = tone && tone.name ? String(tone.name) : 'Balanced starting point';
          elements.toneSummary.textContent = tone && tone.summary
            ? String(tone.summary)
            : 'Choose a direction or describe what you need. The machine will keep you inside the public listening library.';
          elements.play.dataset.playing = playing ? 'true' : 'false';
          elements.play.textContent = playing ? 'Pause preview' : 'Start explicit preview';
          renderWavePaths();
          Array.prototype.forEach.call(document.querySelectorAll('.state-button'), function (button) {
            button.setAttribute('aria-pressed', button.dataset.state === state.targetState ? 'true' : 'false');
          });
        }

        function updateOscillators() {
          if (!audioContext || !leftOscillator || !rightOscillator) return;
          var now = audioContext.currentTime;
          leftOscillator.frequency.setTargetAtTime(state.carrierHz, now, .04);
          rightOscillator.frequency.setTargetAtTime(state.carrierHz + state.beatHz, now, .04);
          if (masterGain) masterGain.gain.setTargetAtTime((state.volume / 100) * .07, now, .04);
        }

        function stopAudioNodes(leftNode, rightNode, gainNode) {
          var left = arguments.length ? leftNode : leftOscillator;
          var right = arguments.length ? rightNode : rightOscillator;
          var gain = arguments.length ? gainNode : masterGain;
          try { if (left) left.stop(); } catch (error) {}
          try { if (right) right.stop(); } catch (error) {}
          try { if (left) left.disconnect(); } catch (error) {}
          try { if (right) right.disconnect(); } catch (error) {}
          try { if (gain) gain.disconnect(); } catch (error) {}
          if (leftOscillator === left) leftOscillator = null;
          if (rightOscillator === right) rightOscillator = null;
          if (masterGain === gain) masterGain = null;
        }

        function stopAudio() {
          startAttempt += 1;
          playing = false;
          state.isPlaying = false;
          lastAction = 'stop';
          stopWaveAnimation();
          if (masterGain && audioContext) masterGain.gain.setTargetAtTime(0, audioContext.currentTime, .06);
          var left = leftOscillator;
          var right = rightOscillator;
          var gain = masterGain;
          window.setTimeout(function () {
            stopAudioNodes(left, right, gain);
            render();
          }, 120);
          render();
          scheduleModelContextUpdate();
        }

        function watchAudioContext(context) {
          if (!context || typeof context.addEventListener !== 'function' || watchedAudioContext === context) return;
          watchedAudioContext = context;
          context.addEventListener('statechange', function () {
            if (context !== audioContext) return;
            if (context.state !== 'running' && playing) {
              playing = false;
              state.isPlaying = false;
              lastAction = 'audio-suspended';
              stopWaveAnimation();
              setStatus('Audio was suspended by the browser. Press Start explicit preview to resume.', 'neutral');
              render();
            }
            scheduleModelContextUpdate();
          });
        }

        function resumeAudioContext() {
          if (!audioContext || audioContext.state === 'closed') return Promise.resolve(false);
          if (audioContext.state === 'running') return Promise.resolve(true);
          if (typeof audioContext.resume !== 'function') return Promise.resolve(false);
          try {
            return Promise.resolve(audioContext.resume()).then(function () {
              return Boolean(audioContext && audioContext.state === 'running');
            }).catch(function () { return false; });
          } catch (error) {
            return Promise.resolve(false);
          }
        }

        function failAudioStart(message) {
          playing = false;
          state.isPlaying = false;
          lastAction = 'audio-blocked';
          stopWaveAnimation();
          stopAudioNodes();
          setStatus(message, 'neutral');
          render();
          scheduleModelContextUpdate();
          return false;
        }

        function startAudio() {
          if (startPromise) return startPromise;
          var AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (!AudioContextClass) {
            setStatus('This browser does not support local audio preview.', 'error');
            scheduleModelContextUpdate();
            return Promise.resolve(false);
          }
          var attempt = ++startAttempt;
          try {
            audioContext = audioContext || new AudioContextClass();
            watchAudioContext(audioContext);
            startPromise = resumeAudioContext().then(function (running) {
              if (attempt !== startAttempt) return false;
              if (!running) return failAudioStart('The browser blocked automatic audio. Press Start explicit preview to begin listening.');
              if (playing && leftOscillator && rightOscillator) {
                updateOscillators();
                return true;
              }
              stopPackAudio();
              stopAudioNodes();
              var now = audioContext.currentTime;
              leftOscillator = audioContext.createOscillator();
              rightOscillator = audioContext.createOscillator();
              leftOscillator.type = 'sine';
              rightOscillator.type = 'sine';
              leftOscillator.frequency.setValueAtTime(state.carrierHz, now);
              rightOscillator.frequency.setValueAtTime(state.carrierHz + state.beatHz, now);
              var merger = audioContext.createChannelMerger(2);
              leftOscillator.connect(merger, 0, 0);
              rightOscillator.connect(merger, 0, 1);
              masterGain = audioContext.createGain();
              masterGain.gain.setValueAtTime(0, now);
              masterGain.gain.linearRampToValueAtTime((state.volume / 100) * .07, now + .12);
              merger.connect(masterGain);
              masterGain.connect(audioContext.destination);
              leftOscillator.start(now);
              rightOscillator.start(now);
              playing = true;
              state.isPlaying = true;
              lastAction = 'start';
              startWaveAnimation();
              setStatus('Preview is playing locally. Stop any time.', 'success');
              render();
              scheduleModelContextUpdate();
              return true;
            }).catch(function () {
              if (attempt !== startAttempt) return false;
              return failAudioStart('The browser could not start local audio. Press Start explicit preview to try again.');
            }).then(function (result) {
              startPromise = null;
              return result;
            });
            return startPromise;
          } catch (error) {
            startPromise = Promise.resolve(failAudioStart('The browser could not start local audio. Press Start explicit preview to try again.'));
            return startPromise;
          }
        }

        function requestBridge(method, params) {
          return new Promise(function (resolve, reject) {
            var id = 'machine-' + String(++requestSequence);
            var timer = window.setTimeout(function () {
              pendingRequests.delete(id);
              reject(new Error('The app host did not answer in time.'));
            }, 7000);
            pendingRequests.set(id, {
              resolve: function (result) { window.clearTimeout(timer); resolve(result); },
              reject: function (error) { window.clearTimeout(timer); reject(error); }
            });
            window.parent.postMessage({ jsonrpc: '2.0', id: id, method: method, params: params }, '*');
          });
        }

        function callServerTool(name, args) {
          if (window.parent !== window) {
            return requestBridge('tools/call', { name: name, arguments: args || {} }).catch(function (error) {
              if (window.openai && typeof window.openai.callTool === 'function') return window.openai.callTool(name, args || {});
              throw error;
            });
          }
          if (window.openai && typeof window.openai.callTool === 'function') return window.openai.callTool(name, args || {});
          return Promise.reject(new Error('This machine is waiting for a compatible app host.'));
        }

        function handleServerResult(value, options) {
          var data = structuredContent(value);
          applyOutput(value, options);
          return data;
        }

        function generateTone(event) {
          event.preventDefault();
          var intention = String(elements.intention.value || '').trim();
          if (!intention || intention.length > 240) {
            setStatus('Write a short direction, up to 240 characters.', 'error');
            return;
          }
          setStatus('Finding a public tone for that direction…', 'neutral');
          callServerTool('recommend_tone', { intention: intention })
            .then(function (result) {
              var data = handleServerResult(result) || {};
              if (data.tone) {
                tone = data.tone;
                applyControls({
                  targetState: data.tone.state,
                  carrierHz: data.tone.baseFreqHz,
                  beatHz: data.tone.targetHz
                });
              }
              setStatus(data.rationale || 'Your public tone is ready to tune.', 'success');
              persistState();
              render();
            })
            .catch(function () {
              setStatus('The public library could not be reached. The local controls are still available.', 'error');
            });
        }

        function usePack(pack) {
          if (!pack || !Array.isArray(pack.states) || !pack.states.length) return;
          var selectedState = allowedStates.indexOf(pack.states[0]) !== -1 ? pack.states[0] : 'theta';
          tone = null;
          applyControls({ targetState: selectedState, beatHz: STATES[selectedState] });
          setStatus(String(pack.name || 'That direction') + ' is ready to tune.', 'success');
          persistState();
          callServerTool('set_machine_direction', { targetState: selectedState })
            .then(function (result) { handleServerResult(result); })
            .catch(function () {});
        }

        function renderPacks(packs) {
          elements.packList.replaceChildren();
          if (!Array.isArray(packs) || !packs.length) {
            var empty = document.createElement('p');
            empty.className = 'hint';
            empty.textContent = 'No matching public packs were found.';
            elements.packList.appendChild(empty);
          } else {
            packs.slice(0, 6).forEach(function (pack) {
              var row = document.createElement('div');
              row.className = 'pack-item';
              var copy = document.createElement('div');
              var name = document.createElement('strong');
              name.textContent = String(pack.name || 'Public tone pack');
              var detail = document.createElement('span');
              detail.textContent = Array.isArray(pack.states) ? pack.states.join(' · ') : 'public direction';
              copy.appendChild(name);
              copy.appendChild(detail);
              var use = document.createElement('button');
              use.className = 'pack-use';
              use.type = 'button';
              use.textContent = 'Use direction';
              use.addEventListener('click', function () { usePack(pack); });
              row.appendChild(copy);
              row.appendChild(use);
              elements.packList.appendChild(row);
            });
          }
          elements.packList.hidden = false;
        }

        function browsePacks() {
          setStatus('Looking through the public pack library…', 'neutral');
          callServerTool('search_public_tone_packs', { query: 'relaxation', limit: 6 })
            .then(function (result) {
              var data = handleServerResult(result) || {};
              renderPacks(data.packs || []);
              setStatus('Here are a few finished directions to try.', 'success');
            })
            .catch(function () {
              setStatus('The pack library could not be reached right now.', 'error');
            });
        }

        function currentIntention() {
          return String(elements.intention.value || '').trim().slice(0, 240) || 'a clear, comfortable reset';
        }

        function clearGuide() {
          elements.guideOutput.replaceChildren();
          elements.guideOutput.hidden = false;
        }

        function renderCue(cueResult) {
          clearGuide();
          var heading = document.createElement('h3');
          heading.textContent = cueResult?.cue?.title || 'A small starting cue';
          var copy = document.createElement('p');
          copy.textContent = cueResult?.cue?.prompt || 'Choose one small thing to notice during the session.';
          var meta = document.createElement('p');
          meta.textContent = (cueResult?.modeLabel || 'Session cue') + ' · ' + String(cueResult?.cue?.suggestedSeconds || 60) + ' seconds · audio stays off';
          elements.guideOutput.appendChild(heading);
          elements.guideOutput.appendChild(copy);
          elements.guideOutput.appendChild(meta);
        }

        function renderPlan(plan) {
          clearGuide();
          var heading = document.createElement('h3');
          heading.textContent = (plan?.modeLabel || 'Listening plan') + ' · ' + String(plan?.durationMin || 20) + ' minutes';
          var copy = document.createElement('p');
          copy.textContent = plan?.rationale || 'A bounded plan for the moment you described.';
          var list = document.createElement('ol');
          list.className = 'guide-list';
          (plan?.phases || []).forEach(function (phase) {
            var item = document.createElement('li');
            var title = document.createElement('strong');
            title.textContent = String(phase.label || 'Session phase') + ' · ' + String(Math.round(Number(phase.durationSec || 0) / 60)) + ' min · ' + String(phase.tone?.name || phase.tone?.state || 'public tone');
            var detail = document.createElement('span');
            detail.textContent = String(phase.instruction || 'Tune this phase until it feels usable.');
            item.appendChild(title);
            item.appendChild(detail);
            list.appendChild(item);
          });
          var cue = document.createElement('div');
          cue.className = 'guide-cue';
          var cueTitle = document.createElement('strong');
          cueTitle.textContent = String(plan?.cue?.title || 'Practice cue');
          var cuePrompt = document.createElement('span');
          cuePrompt.textContent = String(plan?.cue?.prompt || 'Use the session as a starting point, not a test.');
          cue.appendChild(cueTitle);
          cue.appendChild(cuePrompt);
          elements.guideOutput.appendChild(heading);
          elements.guideOutput.appendChild(copy);
          elements.guideOutput.appendChild(list);
          elements.guideOutput.appendChild(cue);
        }

        function renderComparison(comparison) {
          clearGuide();
          var heading = document.createElement('h3');
          heading.textContent = 'Compare ' + String(comparison?.modeLabel || 'directions').toLowerCase();
          var copy = document.createElement('p');
          copy.textContent = comparison?.note || 'These are starting points with different listening tradeoffs.';
          var grid = document.createElement('div');
          grid.className = 'comparison-grid';
          (comparison?.options || []).forEach(function (option) {
            var item = document.createElement('div');
            item.className = 'comparison-item';
            var title = document.createElement('strong');
            title.textContent = String(option.rank || '') + '. ' + String(option.tone?.name || 'Public tone') + ' · ' + String(option.tone?.state || '');
            var detail = document.createElement('span');
            detail.textContent = String(option.bestFor || '') + '. Tradeoff: ' + String(option.tradeoff || '');
            item.appendChild(title);
            item.appendChild(detail);
            grid.appendChild(item);
          });
          elements.guideOutput.appendChild(heading);
          elements.guideOutput.appendChild(copy);
          elements.guideOutput.appendChild(grid);
        }

        function renderGuidance(guidance) {
          clearGuide();
          var heading = document.createElement('h3');
          heading.textContent = guidance?.status === 'needs_input' ? 'Choose a direction' : String(guidance?.direction?.label || 'A clear starting direction');
          var copy = document.createElement('p');
          copy.textContent = guidance?.status === 'needs_input'
            ? 'A broad request can start in a few different places. Choose the one that sounds most useful right now.'
            : String(guidance?.direction?.description || 'This direction is a starting point for the moment you described.');
          var list = document.createElement('ul');
          list.className = 'guide-list';
          var choices = guidance?.status === 'needs_input' ? guidance?.choices : [guidance?.direction];
          (Array.isArray(choices) ? choices : []).slice(0, 3).forEach(function (choice) {
            if (!choice) return;
            var item = document.createElement('li');
            var title = document.createElement('strong');
            title.textContent = String(choice.label || choice.id || 'Listening direction');
            var detail = document.createElement('span');
            detail.textContent = String(choice.example || choice.description || 'A public starting direction.');
            item.appendChild(title);
            item.appendChild(detail);
            list.appendChild(item);
          });
          elements.guideOutput.appendChild(heading);
          elements.guideOutput.appendChild(copy);
          if (list.children.length) elements.guideOutput.appendChild(list);
          var next = document.createElement('p');
          next.textContent = String(guidance?.nextAction || 'Review the direction before starting a preview.');
          elements.guideOutput.appendChild(next);
        }

        function clarifyIntention() {
          setStatus('Finding a few useful directions…', 'neutral');
          callServerTool('clarify_intention', { intention: currentIntention() })
            .then(function (result) {
              var data = handleServerResult(result) || {};
              if (data && data.status) renderGuidance(data);
              setStatus('Here are a few ways to frame the next moment.', 'success');
            })
            .catch(function () { setStatus('The direction helper could not be reached right now.', 'error'); });
        }

        function calibrateTone(feedback) {
          setStatus('Tuning the visible controls from your feedback…', 'neutral');
          callServerTool('calibrate_tone', {
            feedback: feedback,
            targetState: state.targetState,
            carrierHz: state.carrierHz,
            beatHz: state.beatHz,
            volume: state.volume
          })
            .then(function (result) {
              var data = handleServerResult(result) || {};
              var calibration = data.calibration || data;
              if (calibration && calibration.controls) applyControls(calibration.controls);
              setStatus(calibration?.message || 'The visible controls were updated. Audio remains off.', 'success');
              persistState();
              render();
            })
            .catch(function () { setStatus('The tone could not be calibrated right now.', 'error'); });
        }

        function buildPlan() {
          setStatus('Building a bounded session plan…', 'neutral');
          callServerTool('plan_listening_session', { intention: currentIntention(), durationMin: 20 })
            .then(function (result) {
              var data = handleServerResult(result) || {};
              if (data && data.plan) renderPlan(data.plan);
              setStatus('Your three-part session plan is ready.', 'success');
            })
            .catch(function () { setStatus('The session plan could not be reached right now.', 'error'); });
        }

        function compareDirections() {
          setStatus('Comparing approved directions…', 'neutral');
          callServerTool('compare_tone_directions', { intention: currentIntention(), limit: 3 })
            .then(function (result) {
              var data = handleServerResult(result) || {};
              if (data && data.options) renderComparison(data);
              setStatus('Here are a few bounded directions to compare.', 'success');
            })
            .catch(function () { setStatus('The tone comparison could not be reached right now.', 'error'); });
        }

        function getCue() {
          setStatus('Finding a small practice cue…', 'neutral');
          callServerTool('get_session_cue', { intention: currentIntention() })
            .then(function (result) {
              var data = handleServerResult(result) || {};
              if (data && data.cue) renderCue(data.cue);
              setStatus('Your practice cue is ready. Nothing has been saved.', 'success');
            })
            .catch(function () { setStatus('The session cue could not be reached right now.', 'error'); });
        }

        function applyStatePreset(nextState, nextBeat) {
          if (allowedStates.indexOf(nextState) === -1) return;
          tone = null;
          applyControls({ targetState: nextState, beatHz: nextBeat || STATES[nextState] });
          setStatus(nextState.charAt(0).toUpperCase() + nextState.slice(1) + ' direction selected.', 'success');
          persistState();
          callServerTool('set_machine_direction', { targetState: nextState, beatHz: nextBeat || STATES[nextState] })
            .then(function (result) { handleServerResult(result); })
            .catch(function () {});
        }

        function syncControl(field, value) {
          var input = {};
          input[field] = Number(value);
          callServerTool('set_machine_controls', input)
            .then(function (result) { handleServerResult(result); })
            .catch(function () {});
        }

        elements.form.addEventListener('submit', generateTone);
        elements.carrierRange.addEventListener('input', function () { applyControls({ carrierHz: elements.carrierRange.value }); persistState(); });
        elements.carrierRange.addEventListener('change', function () { syncControl('carrierHz', elements.carrierRange.value); });
        elements.rhythmRange.addEventListener('input', function () { applyControls({ beatHz: elements.rhythmRange.value }); persistState(); });
        elements.rhythmRange.addEventListener('change', function () { syncControl('beatHz', elements.rhythmRange.value); });
        elements.volumeRange.addEventListener('input', function () { applyControls({ volume: elements.volumeRange.value }); persistState(); });
        elements.volumeRange.addEventListener('change', function () { syncControl('volume', elements.volumeRange.value); });
        elements.play.addEventListener('click', function () {
          if (playing) {
            stopAudio();
            callServerTool('stop_machine_preview', {})
              .then(function (result) { handleServerResult(result, { skipAudioAction: true }); })
              .catch(function () {});
          } else {
            startAudio();
            callServerTool('start_machine_preview', { confirmed: true })
              .then(function (result) { handleServerResult(result, { skipAudioAction: true }); })
              .catch(function () {});
          }
        });
        elements.packs.addEventListener('click', browsePacks);
        elements.gamma.addEventListener('click', function () {
          tone = null;
          applyControls({ targetState: 'gamma', beatHz: 39.5, carrierHz: 246 });
          setStatus('Gamma is set with a 246 Hz carrier.', 'success');
          persistState();
          callServerTool('set_machine_direction', { targetState: 'gamma', carrierHz: 246, beatHz: 39.5 })
            .then(function (result) { handleServerResult(result); })
            .catch(function () {});
        });
        elements.smaller.addEventListener('click', function () {
          var previousCarrierHz = state.carrierHz;
          applyControls({ carrierHz: Math.max(100, state.carrierHz - 24) });
          setStatus('Carrier lowered to ' + String(state.carrierHz) + ' Hz.', 'success');
          persistState();
          callServerTool('adjust_machine_controls', { control: 'carrier', direction: 'smaller', step: 24 })
            .then(function (result) { handleServerResult(result, { skipControlChanges: true }); })
            .catch(function () { if (state.carrierHz === previousCarrierHz) render(); });
        });
        elements.plan.addEventListener('click', buildPlan);
        elements.compare.addEventListener('click', compareDirections);
        elements.cue.addEventListener('click', getCue);
        elements.clarify.addEventListener('click', clarifyIntention);
        Array.prototype.forEach.call(document.querySelectorAll('[data-feedback]'), function (button) {
          button.addEventListener('click', function () { calibrateTone(button.dataset.feedback); });
        });
        elements.expand.addEventListener('click', function () {
          callServerTool('open_machine_fullscreen', {})
            .then(function (result) { handleServerResult(result); })
            .catch(function () {
              if (window.openai && typeof window.openai.requestDisplayMode === 'function') {
                window.openai.requestDisplayMode({ mode: 'fullscreen' }).catch(function () {});
              } else {
                setStatus('A larger view is available when the host supports it.', 'neutral');
              }
            });
        });
        Array.prototype.forEach.call(document.querySelectorAll('.state-button'), function (button) {
          button.addEventListener('click', function () { applyStatePreset(button.dataset.state, Number(button.dataset.hz)); });
        });

        window.addEventListener('message', function (event) {
          if (event.source !== window.parent) return;
          var message = event.data;
          if (!message || message.jsonrpc !== '2.0') return;
          if (message.id !== undefined && pendingRequests.has(String(message.id))) {
            var pending = pendingRequests.get(String(message.id));
            pendingRequests.delete(String(message.id));
            if (message.error) pending.reject(message.error);
            else pending.resolve(message.result);
            return;
          }
          if (message.method === 'ui/notifications/tool-result') applyOutput(message.params && (message.params.structuredContent || message.params));
          if (message.method === 'ui/notifications/tool-input') {
            var input = message.params && message.params.input ? message.params.input : message.params;
            if (input && input.intention && !elements.intention.value) elements.intention.value = String(input.intention).slice(0, 240);
          }
        }, { passive: true });

        var savedState = window.openai && window.openai.widgetState;
        if (savedState && typeof savedState === 'object') applyControls(savedState);
        var initialInput = window.openai && window.openai.toolInput;
        if (initialInput && initialInput.intention) elements.intention.value = String(initialInput.intention).slice(0, 240);
        applyOutput(window.openai && window.openai.toolOutput);
        elements.hostNote.textContent = window.openai ? 'Connected' : '';
        render();
      }());
    </script>
  </body>
</html>`;
