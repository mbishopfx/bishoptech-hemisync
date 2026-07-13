import nodemailer from 'nodemailer';

const DEFAULT_FROM = 'Cognistration <matt@bishoptech.dev>';

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildMessage({ packName, downloadUrl, sessionId }) {
  const safePackName = escapeHtml(packName);
  const safeDownloadUrl = escapeHtml(downloadUrl);
  const safeSessionId = escapeHtml(sessionId);

  return {
    subject: `Your Cognistration ${packName} is ready`,
    text: [
      `Your Cognistration ${packName} is ready.`,
      '',
      'Your one-time purchase is complete.',
      `Download your pack: ${downloadUrl}`,
      '',
      `Checkout reference: ${sessionId}`,
      '',
      'Cognistration audio is an intentional listening tool, not medical treatment or a guarantee of a particular neurological outcome.'
    ].join('\n'),
    html: `
      <div style="background:#09090b;color:#f4f4f5;padding:32px;font-family:Arial,sans-serif;line-height:1.6">
        <p style="color:#67e8f9;font-size:12px;letter-spacing:.18em;text-transform:uppercase">Cognistration audio delivery</p>
        <h1 style="font-weight:500">Your ${safePackName} is ready.</h1>
        <p>Your one-time purchase is complete. Download the full audio pack below and keep this email for later access.</p>
        <p><a href="${safeDownloadUrl}" style="display:inline-block;background:#67e8f9;color:#09090b;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">Download your pack</a></p>
        <p style="color:#a1a1aa;font-size:12px">Checkout reference: ${safeSessionId}</p>
        <p style="color:#a1a1aa;font-size:12px">Cognistration audio is an intentional listening tool, not medical treatment or a guarantee of a particular neurological outcome.</p>
      </div>
    `
  };
}

async function sendWithResend({ apiKey, from, to, message }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to: [to], ...message })
  });

  if (!response.ok) {
    const detail = await response.text();
    return { sent: false, reason: `Email provider returned ${response.status}: ${detail.slice(0, 300)}` };
  }

  const data = await response.json().catch(() => ({}));
  return { sent: true, provider: 'resend', id: data.id || null };
}

async function sendWithSmtp({ to, from, message }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || (port === 465)).toLowerCase() === 'true';
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
  const result = await transporter.sendMail({ from, to, ...message });
  return { sent: true, provider: 'smtp', id: result.messageId || null };
}

export async function sendPackDeliveryEmail({ to, packName, downloadUrl, sessionId }) {
  const from = process.env.PACK_DELIVERY_FROM
    || process.env.SMTP_FROM
    || process.env.RESEND_FROM_EMAIL
    || DEFAULT_FROM;

  if (!downloadUrl) {
    return { sent: false, skipped: true, reason: 'Pack bundle is not available yet' };
  }

  const message = buildMessage({ packName, downloadUrl, sessionId });
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  const resendKey = process.env.RESEND_API_KEY;

  if (smtpConfigured) {
    try {
      const smtpResult = await sendWithSmtp({ to, from, message });
      if (smtpResult) return smtpResult;
    } catch (error) {
      if (!resendKey) {
        return { sent: false, reason: `SMTP delivery failed: ${error?.message || 'unknown SMTP error'}` };
      }
    }
  }

  if (resendKey) return sendWithResend({ apiKey: resendKey, from, to, message });

  return {
    sent: false,
    skipped: true,
    reason: 'No pack email provider configured. Set RESEND_API_KEY or SMTP_HOST, SMTP_USER, and SMTP_PASS.'
  };
}
