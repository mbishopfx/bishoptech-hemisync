import {
  ACCOUNT_SIGNUP_CAPABILITY_ID,
  ACCOUNT_SIGNUP_CAPABILITY_VERSION
} from './account-capability.js';

export const ACCOUNT_SIGNUP_WIDGET_RESOURCE_URI = 'ui://cognistration/account-signup/v1.html';
export const ACCOUNT_SIGNUP_WIDGET_RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

export const ACCOUNT_SIGNUP_WIDGET_RESOURCE_META = {
  ui: {
    prefersBorder: true,
    domain: 'https://cognistration.com',
    csp: {
      connectDomains: ['https://cognistration.com'],
      resourceDomains: ['https://cognistration.com'],
      frameDomains: []
    }
  },
  'openai/widgetDescription': 'An in-platform Cognistration account form. Credentials are sent directly to the first-party signup endpoint only after the user submits the form; checkout is not submitted by the widget.',
  'openai/widgetPrefersBorder': true,
  'openai/widgetDomain': 'https://cognistration.com',
  'openai/widgetCSP': {
    connect_domains: ['https://cognistration.com'],
    resource_domains: ['https://cognistration.com'],
    frame_domains: []
  }
};

export const ACCOUNT_SIGNUP_WIDGET_HTML = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cognistration account form</title>
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
      button, input { font: inherit; }
      button:focus-visible, input:focus-visible { outline: 2px solid var(--mint); outline-offset: 3px; }
      .account-shell { max-width: 620px; margin: 0 auto; padding: 24px; background: radial-gradient(circle at 82% 0%, rgba(199, 232, 216, .13), transparent 42%), linear-gradient(145deg, #122a24, #0b1d19 62%, #121621); }
      .eyebrow { display: flex; align-items: center; gap: 9px; color: var(--mint); font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; }
      .eyebrow-mark { width: 9px; height: 9px; border: 1px solid var(--mint); border-radius: 50%; box-shadow: 0 0 16px rgba(199, 232, 216, .6); }
      h1 { max-width: 520px; margin: 36px 0 0; font-size: clamp(32px, 7vw, 54px); line-height: 1; letter-spacing: -.06em; font-weight: 560; }
      .intro { max-width: 520px; margin: 16px 0 0; color: var(--muted); font-size: 14px; line-height: 1.65; }
      .boundary { margin-top: 18px; border: 1px solid rgba(199, 232, 216, .17); border-radius: 16px; background: rgba(199, 232, 216, .06); padding: 13px 14px; color: var(--muted); font-size: 12px; line-height: 1.55; }
      .boundary strong { color: var(--mint); font-weight: 650; }
      .form-panel { margin-top: 20px; border: 1px solid var(--line); border-radius: 22px; background: var(--panel); padding: 20px; }
      .field { margin-top: 16px; }
      .field:first-child { margin-top: 0; }
      label { display: block; color: var(--muted); font-size: 12px; font-weight: 650; }
      input { width: 100%; margin-top: 7px; border: 1px solid var(--line); border-radius: 13px; background: rgba(2, 12, 10, .56); color: var(--ink); padding: 12px 13px; }
      input::placeholder { color: rgba(232, 242, 236, .3); }
      .hint { display: block; margin-top: 6px; color: var(--soft); font-size: 10px; line-height: 1.45; }
      .submit { width: 100%; min-height: 46px; margin-top: 20px; border: 0; border-radius: 13px; background: var(--mint); color: #122c24; font-weight: 700; cursor: pointer; transition: filter .2s ease, transform .2s ease; }
      .submit:hover { filter: brightness(1.08); transform: translateY(-1px); }
      .submit:disabled { cursor: wait; opacity: .6; transform: none; }
      .status { min-height: 20px; margin: 13px 0 0; color: var(--soft); font-size: 12px; line-height: 1.5; }
      .status[data-kind="error"] { color: var(--warm); }
      .status[data-kind="success"] { color: var(--mint); }
      .success { border: 1px solid rgba(199, 232, 216, .18); border-radius: 16px; background: rgba(199, 232, 216, .07); padding: 16px; }
      .success h2 { margin: 0; color: var(--mint); font-size: 17px; letter-spacing: -.02em; }
      .success p { margin: 8px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
      .footnote { margin: 16px 2px 0; color: var(--soft); font-size: 10px; line-height: 1.55; }
      [hidden] { display: none !important; }
    </style>
  </head>
  <body>
    <main class="account-shell" data-account-widget>
      <div class="eyebrow"><span class="eyebrow-mark" aria-hidden="true"></span><span>Cognistration account</span></div>
      <h1>Keep the practice you started.</h1>
      <p class="intro">Create a free login from this conversation. Public previews remain free; the private workspace is a separate, one-time $20 purchase after you verify and sign in.</p>
      <div class="boundary"><strong>Your review stays in control.</strong> Nothing is submitted until you press the button. Credentials are sent directly to Cognistration's first-party signup endpoint, not into an MCP tool argument. Checkout is never submitted here.</div>

      <section class="form-panel" aria-labelledby="form-title">
        <h2 id="form-title" style="margin:0; font-size:18px; letter-spacing:-.03em;">Create your account</h2>
        <form id="account-form" novalidate>
          <div class="field">
            <label for="account-username">Username</label>
            <input id="account-username" name="username" type="text" minlength="3" maxlength="32" autocomplete="username" required placeholder="Choose a username">
            <span class="hint">3–32 letters, numbers, periods, dashes, or underscores.</span>
          </div>
          <div class="field">
            <label for="account-email">Email address</label>
            <input id="account-email" name="email" type="email" maxlength="254" autocomplete="email" required placeholder="you@example.com">
          </div>
          <div class="field">
            <label for="account-password">Password</label>
            <input id="account-password" name="password" type="password" minlength="8" maxlength="128" autocomplete="new-password" required placeholder="At least 8 characters">
          </div>
          <button class="submit" id="account-submit" type="submit">Create account</button>
          <p class="status" id="account-status" role="status" aria-live="polite"></p>
        </form>
        <div class="success" id="account-success" hidden>
          <h2>Account request received.</h2>
          <p id="account-success-copy">Check your email if confirmation is enabled, then sign in to review the private workspace checkout. No payment was submitted.</p>
        </div>
        <p class="footnote">This form only creates the login. Your private workspace remains locked until you review the separate checkout and complete it yourself.</p>
      </section>
    </main>
    <script>
      (function () {
        'use strict';
        var form = document.getElementById('account-form');
        var submit = document.getElementById('account-submit');
        var status = document.getElementById('account-status');
        var success = document.getElementById('account-success');
        var successCopy = document.getElementById('account-success-copy');

        function setStatus(message, kind) {
          status.textContent = message || '';
          status.dataset.kind = kind || 'neutral';
        }

        form.addEventListener('submit', async function (event) {
          event.preventDefault();
          var username = document.getElementById('account-username').value.trim().toLowerCase();
          var email = document.getElementById('account-email').value.trim().toLowerCase();
          var password = document.getElementById('account-password').value;

          if (!/^[a-z0-9_.-]{3,32}$/.test(username)) {
            setStatus('Choose a username with 3–32 letters, numbers, periods, dashes, or underscores.', 'error');
            return;
          }
          if (!email || !document.getElementById('account-email').checkValidity()) {
            setStatus('Enter a valid email address.', 'error');
            return;
          }
          if (password.length < 8 || password.length > 128) {
            setStatus('Use a password between 8 and 128 characters.', 'error');
            return;
          }

          submit.disabled = true;
          setStatus('Creating the login…', 'neutral');
          try {
            var response = await fetch('https://cognistration.com/api/agent/account/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ username: username, email: email, password: password })
            });
            var data = await response.json().catch(function () { return {}; });
            if (!response.ok) throw new Error(data.error || 'The account could not be created.');
            form.hidden = true;
            success.hidden = false;
            successCopy.textContent = data.message || 'Check your email if confirmation is enabled, then sign in to review the private workspace checkout. No payment was submitted.';
            setStatus('', 'success');
          } catch (error) {
            setStatus(error.message || 'The account could not be created. Try again.', 'error');
            submit.disabled = false;
          }
        });
      }());
    </script>
  </body>
</html>`;

export const ACCOUNT_SIGNUP_WIDGET_CONTRACT = {
  capabilityId: ACCOUNT_SIGNUP_CAPABILITY_ID,
  version: ACCOUNT_SIGNUP_CAPABILITY_VERSION,
  resourceUri: ACCOUNT_SIGNUP_WIDGET_RESOURCE_URI
};
