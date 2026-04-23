import Stripe from 'stripe';
import { createClerkClient } from '@clerk/backend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const sig = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
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

    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
