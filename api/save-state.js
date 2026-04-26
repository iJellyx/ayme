import { createClerkClient, verifyToken } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const MAX_STATE_BYTES = 7000; // Clerk publicMetadata limit is ~8KB; leave headroom

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export default async function handler(req, res) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Missing session token' });
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const userId = claims.sub;

    if (req.method === 'GET') {
      const user = await clerk.users.getUser(userId);
      return res.status(200).json({
        state: user.publicMetadata?.savedState || null,
        savedAt: user.publicMetadata?.savedStateAt || null,
      });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const state = body?.state;
      if (!state || typeof state !== 'object') {
        return res.status(400).json({ error: 'Missing state object' });
      }
      const payload = JSON.stringify(state);
      if (payload.length > MAX_STATE_BYTES) {
        return res.status(413).json({ error: 'State too large', size: payload.length, limit: MAX_STATE_BYTES });
      }
      const user = await clerk.users.getUser(userId);
      const savedAt = new Date().toISOString();
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          savedState: state,
          savedStateAt: savedAt,
        },
      });
      return res.status(200).json({ ok: true, savedAt });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  } catch (err) {
    console.error('save-state error', err?.message);
    return res.status(500).json({ error: err?.message || 'Sync failed' });
  }
}
