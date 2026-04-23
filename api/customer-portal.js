import Stripe from 'stripe';
import { createClerkClient } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Missing session token' });

    const claims = await clerk.verifyToken(token);
    const user = await clerk.users.getUser(claims.sub);
    const customerId = user.publicMetadata?.stripeCustomerId;
    if (!customerId) return res.status(400).json({ error: 'No active subscription' });

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: origin,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('customer-portal error', err);
    return res.status(500).json({ error: err.message || 'Portal failed' });
  }
}
