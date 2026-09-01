import {
  FEEDBACK_CAPABILITY_ID,
  FEEDBACK_CAPABILITY_VERSION
} from './feedback-capability.js';

export const FEEDBACK_WIDGET_RESOURCE_URI = 'ui://cognistration/feedback/v1.html';
export const FEEDBACK_WIDGET_RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

export const FEEDBACK_WIDGET_RESOURCE_META = {
  ui: {
    prefersBorder: false,
    domain: 'https://cognistration.com',
    csp: {
      connectDomains: ['https://cognistration.com'],
      resourceDomains: ['https://cognistration.com'],
      frameDomains: []
    }
  },
  'openai/widgetDescription': 'A private in-platform Cognistration feedback card with thumbs up or down and an optional short note. The user explicitly submits feedback to a first-party endpoint; feedback history is not displayed in the widget.',
  'openai/widgetPrefersBorder': false,
  'openai/widgetDomain': 'https://cognistration.com',
  'openai/widgetCSP': {
    connect_domains: ['https://cognistration.com'],
    resource_domains: ['https://cognistration.com'],
    frame_domains: []
  }
};

export const FEEDBACK_WIDGET_HTML = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cognistration feedback</title>
    <style>
      :root {
        color-scheme: dark;
        --ink: #f4f7f4;
        --muted: rgba(232, 242, 236, .66);
        --soft: rgba(232, 242, 236, .42);
        --line: rgba(226, 243, 235, .15);
        --panel: rgba(11, 25, 22, .84);
        --mint: #c7e8d8;
        --warm: #f2c7ae;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; min-height: 100%; background: #091612; }
      body { color: var(--ink); }
      button, textarea { font: inherit; }
      button:focus-visible, textarea:focus-visible { outline: 2px solid var(--mint); outline-offset: 3px; }
      .feedback-shell { max-width: 620px; margin: 0 auto; padding: 22px; background: radial-gradient(circle at 80% 0%, rgba(199, 232, 216, .14), transparent 42%), linear-gradient(145deg, #122a24, #0b1d19 62%, #121621); }
      .eyebrow { color: var(--mint); font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
      h1 { margin: 24px 0 0; font-size: clamp(28px, 6vw, 44px); line-height: 1.02; letter-spacing: -.06em; font-weight: 560; }
      .intro { margin: 12px 0 0; color: var(--muted); font-size: 14px; line-height: 1.6; }
      .feedback-panel { margin-top: 18px; border: 1px solid var(--line); border-radius: 22px; background: var(--panel); padding: 18px; }
      .rating-label { color: var(--muted); font-size: 12px; font-weight: 650; }
      .rating-group { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
      .rating { min-height: 52px; border: 1px solid var(--line); border-radius: 14px; background: rgba(255,255,255,.035); color: var(--muted); cursor: pointer; transition: border-color .2s ease, background .2s ease, color .2s ease; }
      .rating:hover { border-color: rgba(199,232,216,.4); color: var(--ink); }
      .rating[aria-pressed="true"] { border-color: rgba(199,232,216,.55); background: rgba(199,232,216,.12); color: var(--mint); }
      .rating span { display: block; margin-top: 3px; font-size: 11px; }
      textarea { width: 100%; min-height: 96px; margin-top: 17px; resize: vertical; border: 1px solid var(--line); border-radius: 13px; background: rgba(2, 12, 10, .56); color: var(--ink); padding: 12px 13px; }
      textarea::placeholder { color: rgba(232,242,236,.3); }
      .counter { margin-top: 5px; color: var(--soft); font-size: 10px; text-align: right; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
      .submit, .dismiss { min-height: 43px; border-radius: 13px; padding: 0 15px; cursor: pointer; }
      .submit { flex: 1 1 190px; border: 0; background: var(--mint); color: #122c24; font-weight: 700; }
      .dismiss { flex: 0 0 auto; border: 1px solid var(--line); background: transparent; color: var(--muted); }
      .submit:hover { filter: brightness(1.08); }
      .dismiss:hover { border-color: rgba(226,243,235,.32); color: var(--ink); }
      button:disabled { cursor: wait; opacity: .6; }
      .status { min-height: 20px; margin: 13px 0 0; color: var(--soft); font-size: 12px; line-height: 1.5; }
      .status[data-kind="error"] { color: var(--warm); }
      .status[data-kind="success"] { color: var(--mint); }
      .success { border: 1px solid rgba(199,232,216,.18); border-radius: 16px; background: rgba(199,232,216,.07); padding: 15px; color: var(--mint); font-size: 13px; line-height: 1.55; }
      .note { margin: 13px 2px 0; color: var(--soft); font-size: 10px; line-height: 1.5; }
      [hidden] { display: none !important; }
    </style>
  </head>
  <body>
    <main class="feedback-shell" data-feedback-widget>
      <div class="eyebrow">A small closing question</div>
      <h1>How was this experience?</h1>
      <p class="intro">Your quick signal helps improve the agent. Choose a rating and add a note only if you want to. Nothing is sent until you submit.</p>

      <section class="feedback-panel" id="feedback-panel" aria-labelledby="rating-label">
        <div class="rating-label" id="rating-label">Choose one</div>
        <div class="rating-group" role="group" aria-label="Experience rating">
          <button class="rating" type="button" data-rating="positive" aria-pressed="false" aria-label="Thumbs up">👍<span>Helpful</span></button>
          <button class="rating" type="button" data-rating="negative" aria-pressed="false" aria-label="Thumbs down">👎<span>Needs work</span></button>
        </div>
        <label for="feedback-note" style="display:block; margin-top:17px; color:var(--muted); font-size:12px; font-weight:650;">Optional note</label>
        <textarea id="feedback-note" maxlength="1000" placeholder="What should we keep or improve?"></textarea>
        <div class="counter"><span id="feedback-count">0</span>/1000</div>
        <div class="actions">
          <button class="submit" id="feedback-submit" type="button" disabled>Submit feedback</button>
          <button class="dismiss" id="feedback-dismiss" type="button">Not now</button>
        </div>
        <p class="status" id="feedback-status" role="status" aria-live="polite"></p>
        <div class="success" id="feedback-success" hidden>Thanks. Your feedback was received privately.</div>
        <p class="note">This widget does not display feedback history, attach an account, or open another site.</p>
      </section>
    </main>
    <script>
      (function () {
        'use strict';
        var rating = null;
        var panel = document.getElementById('feedback-panel');
        var note = document.getElementById('feedback-note');
        var count = document.getElementById('feedback-count');
        var submit = document.getElementById('feedback-submit');
        var dismiss = document.getElementById('feedback-dismiss');
        var status = document.getElementById('feedback-status');
        var success = document.getElementById('feedback-success');

        function setStatus(message, kind) {
          status.textContent = message || '';
          status.dataset.kind = kind || 'neutral';
        }

        function closeWidget() {
          if (window.openai && typeof window.openai.requestClose === 'function') {
            window.openai.requestClose();
            return;
          }
          panel.hidden = true;
        }

        Array.prototype.forEach.call(document.querySelectorAll('[data-rating]'), function (button) {
          button.addEventListener('click', function () {
            rating = button.dataset.rating;
            Array.prototype.forEach.call(document.querySelectorAll('[data-rating]'), function (candidate) {
              candidate.setAttribute('aria-pressed', candidate === button ? 'true' : 'false');
            });
            submit.disabled = false;
            setStatus('', 'neutral');
          });
        });

        note.addEventListener('input', function () {
          count.textContent = String(note.value.length);
        });

        dismiss.addEventListener('click', closeWidget);

        submit.addEventListener('click', async function () {
          if (!rating) return;
          submit.disabled = true;
          dismiss.disabled = true;
          setStatus('Sending…', 'neutral');
          try {
            var response = await fetch('https://cognistration.com/api/agent/feedback', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ rating: rating, comment: note.value.trim() || undefined })
            });
            var data = await response.json().catch(function () { return {}; });
            if (!response.ok) throw new Error(data.error || 'Feedback could not be submitted.');
            panel.hidden = false;
            document.getElementById('rating-label').hidden = true;
            document.querySelector('.rating-group').hidden = true;
            document.querySelector('label[for="feedback-note"]').hidden = true;
            note.hidden = true;
            document.querySelector('.counter').hidden = true;
            document.querySelector('.actions').hidden = true;
            status.hidden = true;
            document.querySelector('.note').hidden = true;
            success.hidden = false;
          } catch (error) {
            setStatus(error.message || 'Feedback could not be submitted. Try again.', 'error');
            submit.disabled = false;
            dismiss.disabled = false;
          }
        });
      }());
    </script>
  </body>
</html>`;

export const FEEDBACK_WIDGET_CONTRACT = {
  capabilityId: FEEDBACK_CAPABILITY_ID,
  version: FEEDBACK_CAPABILITY_VERSION,
  resourceUri: FEEDBACK_WIDGET_RESOURCE_URI
};
