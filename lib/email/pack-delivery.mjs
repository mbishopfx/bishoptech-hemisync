const DEFAULT_FROM = 'Cognistration <matt@bishoptech.dev>';

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sendPackDeliveryEmail({ to, packName, downloadUrl, sessionId }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PACK_DELIVERY_FROM || process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  if (!apiKey) {
    return { sent: false, skipped: true, reason: 'RESEND_API_KEY is not configured' };
  }
  if (!downloadUrl) {
    return { sent: false, skipped: true, reason: 'Pack bundle is not available yet' };
  }

  const safePackName = escapeHtml(packName);
  const safeDownloadUrl = escapeHtml(downloadUrl);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Your Cognistration ${packName} is ready`,
      html: `
        <div style="background:#09090b;color:#f4f4f5;padding:32px;font-family:Arial,sans-serif;line-height:1.6">
          <p style="color:#67e8f9;font-size:12px;letter-spacing:.18em;text-transform:uppercase">Cognistration audio delivery</p>
          <h1 style="font-weight:500">Your ${safePackName} is ready.</h1>
          <p>Your one-time purchase is complete. Download the full audio pack below and keep this email for later access.</p>
          <p><a href="${safeDownloadUrl}" style="display:inline-block;background:#67e8f9;color:#09090b;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">Download your pack</a></p>
          <p style="color:#a1a1aa;font-size:12px">Checkout reference: ${escapeHtml(sessionId)}</p>
          <p style="color:#a1a1aa;font-size:12px">Cognistration audio is an intentional listening tool, not medical treatment or a guarantee of a particular neurological outcome.</p>
        </div>
      `
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    return { sent: false, reason: `Email provider returned ${response.status}: ${detail.slice(0, 300)}` };
  }

  const data = await response.json().catch(() => ({}));
  return { sent: true, id: data.id || null };
}
