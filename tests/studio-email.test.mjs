import assert from 'node:assert/strict';
import test from 'node:test';
import { sendStudioDeliveryEmail } from '../lib/email/studio-delivery.mjs';

const SMTP_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_SECURE', 'SMTP_FROM', 'STUDIO_DELIVERY_FROM'];

function withSmtpEnv(values, callback) {
  const original = Object.fromEntries(SMTP_KEYS.map((key) => [key, process.env[key]]));
  Object.assign(process.env, values);
  for (const key of SMTP_KEYS) {
    if (!(key in values)) delete process.env[key];
  }
  return Promise.resolve(callback()).finally(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test('Studio delivery requires SMTP credentials', async () => {
  await withSmtpEnv({}, async () => {
    const result = await sendStudioDeliveryEmail({
      to: 'member@example.com',
      projectName: 'Focus Session',
      renderUrl: 'https://cognistration.com/dashboard?render=123'
    });
    assert.equal(result.sent, false);
    assert.match(result.reason, /SMTP is not configured/);
  });
});

test('Studio delivery sends through authenticated SMTP', async () => {
  await withSmtpEnv({
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: '465',
    SMTP_USER: 'studio@example.com',
    SMTP_PASS: 'secret'
  }, async () => {
    let transportOptions;
    let mail;
    const result = await sendStudioDeliveryEmail({
      to: 'member@example.com',
      projectName: '<Focus & Flow>',
      renderUrl: 'https://cognistration.com/dashboard?render=123&tab=studio'
    }, {
      createTransport(options) {
        transportOptions = options;
        return {
          async sendMail(message) {
            mail = message;
            return { messageId: 'smtp-message-id' };
          }
        };
      }
    });

    assert.deepEqual(transportOptions, {
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      auth: { user: 'studio@example.com', pass: 'secret' }
    });
    assert.equal(mail.from, 'Cognistration <studio@example.com>');
    assert.equal(mail.to, 'member@example.com');
    assert.match(mail.text, /Focus & Flow/);
    assert.match(mail.html, /&lt;Focus &amp; Flow&gt;/);
    assert.equal(result.provider, 'smtp');
    assert.equal(result.id, 'smtp-message-id');
  });
});
