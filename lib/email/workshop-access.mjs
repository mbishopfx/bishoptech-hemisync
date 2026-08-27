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

function message({ accessUrl, expiresAt }) {
  const safeUrl = escapeHtml(accessUrl);
  const safeExpiry = escapeHtml(new Date(expiresAt).toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' }));
  return {
    subject: 'Your Cognistration machine workshop access',
    text: [
      'Your Cognistration 24-hour machine workshop access is ready.',
      '',
      `Open the machine: ${accessUrl}`,
      `Access expires: ${safeExpiry}`,
      '',
      'Your access key is a bearer link. Keep it private and revoke it if you no longer want it active.',
      'Cognistration audio is an intentional listening tool, not medical treatment or a guarantee of a particular neurological outcome.'
    ].join('\n'),
    html: `<div style="background:#13201d;color:#f7f8f5;padding:32px;font-family:Arial,sans-serif;line-height:1.6"><p style="color:#b6ddcc;font-size:12px;letter-spacing:.18em;text-transform:uppercase">Cognistration workshop access</p><h1 style="font-weight:500">Your machine workshop is ready.</h1><p>You have 24-hour access to the full machine workshop, with sessions up to 60 minutes.</p><p><a href="${safeUrl}" style="display:inline-block;background:#d7eadf;color:#17332e;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">Open the machine</a></p><p style="color:#c5d1ca;font-size:12px">Access expires: ${safeExpiry}</p><p style="color:#9aaba2;font-size:12px">Keep this link private. Cognistration audio is an intentional listening tool, not medical treatment or a guarantee of a particular neurological outcome.</p></div>`
  };
}

async function sendWithSmtp({ to, from, content }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || (port === 465)).toLowerCase() === 'true';
  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  const result = await transporter.sendMail({ from, to, ...content });
  return { sent: true, provider: 'smtp', id: result.messageId || null };
}

async function sendWithResend({ apiKey, from, to, content }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], ...content })
  });
  if (!response.ok) return { sent: false, reason: `Email provider returned ${response.status}` };
  const data = await response.json().catch(() => ({}));
  return { sent: true, provider: 'resend', id: data.id || null };
}

export async function sendWorkshopAccessEmail({ to, accessUrl, expiresAt }) {
  const from = process.env.WORKSHOP_ACCESS_FROM || process.env.SMTP_FROM || process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
  const content = message({ accessUrl, expiresAt });
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  const resendKey = process.env.RESEND_API_KEY;

  if (smtpConfigured) {
    try {
      const result = await sendWithSmtp({ to, from, content });
      if (result) return result;
    } catch (error) {
      if (!resendKey) return { sent: false, reason: `SMTP delivery failed: ${error?.message || 'unknown SMTP error'}` };
    }
  }
  if (resendKey) return sendWithResend({ apiKey: resendKey, from, to, content });
  return { sent: false, skipped: true, reason: 'No workshop email provider configured.' };
}
