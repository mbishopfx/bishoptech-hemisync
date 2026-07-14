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

function buildMessage({ projectName, renderUrl }) {
  return {
    subject: `Your Cognistration tone is ready: ${projectName}`,
    text: [
      `${projectName} is ready.`,
      '',
      'Your private high-quality MP3 master is stored in your Cognistration account.',
      'Sign in to generate a fresh secure download link on any device:',
      renderUrl,
      '',
      'Use stereo headphones at a moderate volume. Cognistration is an intentional listening tool, not medical treatment or a guarantee of a particular neurological outcome.'
    ].join('\n'),
    html: `
      <div style="background:#09090b;color:#f4f4f5;padding:32px;font-family:Arial,sans-serif;line-height:1.6">
        <p style="color:#67e8f9;font-size:12px;letter-spacing:.18em;text-transform:uppercase">Cognistration Studio</p>
        <h1 style="font-weight:500">${escapeHtml(projectName)} is ready.</h1>
        <p>Your private high-quality MP3 master is stored in your Cognistration account. Sign in to generate a fresh secure download link on any device.</p>
        <p><a href="${escapeHtml(renderUrl)}" style="display:inline-block;background:#67e8f9;color:#09090b;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">Open your private export</a></p>
        <p style="color:#a1a1aa;font-size:12px">Use stereo headphones at a moderate volume. Cognistration is an intentional listening tool, not medical treatment or a guarantee of a particular neurological outcome.</p>
      </div>`
  };
}

export async function sendStudioDeliveryEmail(
  { to, projectName, renderUrl },
  { createTransport = nodemailer.createTransport } = {}
) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    return { sent: false, reason: 'Studio SMTP is not configured' };
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || (port === 465)).toLowerCase() === 'true';
  const from = process.env.STUDIO_DELIVERY_FROM
    || process.env.SMTP_FROM
    || (user.includes('@') ? `Cognistration <${user}>` : DEFAULT_FROM);
  const transporter = createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });

  try {
    const result = await transporter.sendMail({
      from,
      to,
      ...buildMessage({ projectName, renderUrl })
    });
    return { sent: true, provider: 'smtp', id: result.messageId || null };
  } catch (error) {
    return { sent: false, reason: `SMTP delivery failed: ${error?.message || 'unknown SMTP error'}` };
  }
}
