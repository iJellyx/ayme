import Stripe from 'stripe';
import { createClerkClient } from '@clerk/backend';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function setSubscriptionStatus(clerkUserId, patch) {
  const user = await clerk.users.getUser(clerkUserId);
  await clerk.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { ...user.publicMetadata, ...patch },
  });
}

async function findUserByStripeCustomer(customerId) {
  let offset = 0;
  const limit = 100;
  while (true) {
    const page = await clerk.users.getUserList({ limit, offset });
    const users = page.data || page;
    const match = users.find((u) => u.publicMetadata?.stripeCustomerId === customerId);
    if (match) return match;
    if (users.length < limit) return null;
    offset += limit;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'];
  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    console.error('[webhook] failed to read body', err.message);
    return res.status(400).send(`Body read error: ${err.message}`);
  }

  console.log('[webhook] received', {
    contentType: req.headers['content-type'],
    bodyLength: rawBody.length,
    hasSig: Boolean(sig),
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message} (bodyLen=${rawBody.length})`);
  }

  try {
    const obj = event.data.object;
    const clerkId = obj.metadata?.clerkUserId || obj.client_reference_id;
    console.log('[webhook] event', event.type, 'clerkId=', clerkId, 'customer=', obj.customer);

    switch (event.type) {
      case 'checkout.session.completed': {
        if (!clerkId) {
          console.warn('[webhook] checkout.session.completed had no clerkUserId');
          break;
        }
        await setSubscriptionStatus(clerkId, {
          subscriptionStatus: 'active',
          stripeCustomerId: obj.customer,
          stripeSubscriptionId: obj.subscription,
        });
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const isActive = obj.status === 'active' || obj.status === 'trialing';
        const status = isActive ? 'active' : 'canceled';
        if (clerkId) {
          await setSubscriptionStatus(clerkId, { subscriptionStatus: status });
        } else {
          const user = await findUserByStripeCustomer(obj.customer);
          if (user) await setSubscriptionStatus(user.id, { subscriptionStatus: status });
          else console.warn('[webhook] no clerk user found for stripe customer', obj.customer);
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhook] handler error', err?.message, err?.stack);
    return res.status(500).json({
      error: err?.message || 'Unknown error',
      name: err?.name,
      clerkErrors: err?.errors,
    });
  }
}
