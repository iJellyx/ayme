import Stripe from 'stripe';
import { createClerkClient } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = { api: { bodyParser: false } };

function readRawBody(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (c) => chunks.push(typeof c === 'string' ? Buffer.from(c) : c));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
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
    const match = page.data.find((u) => u.publicMetadata?.stripeCustomerId === customerId);
    if (match) return match;
    if (page.data.length < limit) return null;
    offset += limit;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'];
  const buf = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const obj = event.data.object;

    switch (event.type) {
      case 'checkout.session.completed': {
        const clerkUserId = obj.metadata?.clerkUserId || obj.client_reference_id;
        if (clerkUserId) {
          await setSubscriptionStatus(clerkUserId, {
            subscriptionStatus: 'active',
            stripeCustomerId: obj.customer,
            stripeSubscriptionId: obj.subscription,
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const clerkUserId = obj.metadata?.clerkUserId;
        const isActive = obj.status === 'active' || obj.status === 'trialing';
        const status = isActive ? 'active' : 'canceled';

        if (clerkUserId) {
          await setSubscriptionStatus(clerkUserId, { subscriptionStatus: status });
        } else {
          const user = await findUserByStripeCustomer(obj.customer);
          if (user) await setSubscriptionStatus(user.id, { subscriptionStatus: status });
        }
        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error', err);
    return res.status(500).json({ error: err.message });
  }
}
