export function requireUserId(req) {
  const headerId = req.headers.get('x-user-id');
  const fallbackId = process.env.DEMO_USER_ID || process.env.NEXT_PUBLIC_DEMO_USER_ID;
  const userId = headerId || fallbackId;
  if (!userId) {
    throw new Error('User authentication required. Provide X-User-Id header or set DEMO_USER_ID.');
  }
  return userId;
}


