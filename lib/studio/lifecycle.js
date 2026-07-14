const ACTIVE_RENDER_PHASES = new Set(['rendering', 'uploading', 'validating']);

export function assertStudioOwnership(record, userId) {
  if (!record || record.user_id !== userId) {
    const error = new Error('Studio resource not found');
    error.status = 404;
    throw error;
  }
  return record;
}

export function getRenderClaimDecision(record, now = Date.now(), staleAfterMs = 30 * 60 * 1000) {
  if (record?.status === 'completed') return 'completed';
  if (!ACTIVE_RENDER_PHASES.has(record?.phase)) return 'claim';
  const updatedAt = new Date(record.updated_at).getTime();
  return Number.isFinite(updatedAt) && now - updatedAt < staleAfterMs ? 'running' : 'claim';
}

export function assertDeliveryCooldown(record, now = Date.now(), cooldownMs = 60 * 1000) {
  if (!record?.delivery_email_sent_at) return;
  const sentAt = new Date(record.delivery_email_sent_at).getTime();
  if (Number.isFinite(sentAt) && now - sentAt < cooldownMs) {
    const error = new Error('Please wait before sending this email again');
    error.status = 429;
    throw error;
  }
}
