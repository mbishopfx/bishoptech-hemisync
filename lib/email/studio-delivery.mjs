const DEFAULT_FROM = 'Cognistration <matt@bishoptech.dev>';

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sendStudioDeliveryEmail({ to, projectName, renderUrl }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.STUDIO_DELIVERY_FROM || process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
  if (!apiKey) return { sent: false, reason: 'RESEND_API_KEY is not configured' };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Your Cognistration tone is ready: ${projectName}`,
      html: `
        <div style="background:#09090b;color:#f4f4f5;padding:32px;font-family:Arial,sans-serif;line-height:1.6">
          <p style="color:#67e8f9;font-size:12px;letter-spacing:.18em;text-transform:uppercase">Cognistration Studio</p>
          <h1 style="font-weight:500">${escapeHtml(projectName)} is ready.</h1>
          <p>Your private WAV and MP3 exports are stored in your Cognistration account. Sign in to generate fresh secure download links on any device.</p>
          <p><a href="${escapeHtml(renderUrl)}" style="display:inline-block;background:#67e8f9;color:#09090b;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">Open your private export</a></p>
          <p style="color:#a1a1aa;font-size:12px">Use stereo headphones at a moderate volume. Cognistration is an intentional listening tool, not medical treatment or a guarantee of a particular neurological outcome.</p>
        </div>`
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    return { sent: false, reason: `Email provider returned ${response.status}: ${detail.slice(0, 300)}` };
  }
  const data = await response.json().catch(() => ({}));
  return { sent: true, id: data.id || null };
}
