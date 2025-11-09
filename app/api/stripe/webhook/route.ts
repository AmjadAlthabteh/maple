import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/stripe';
import { db, subscriptions, organizations } from '@/lib/db';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as 'starter' | 'pro' | 'business';

  if (!userId || !plan) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Get organization
  const org = await db.query.organizations.findFirst({
    where: (organizations, { eq }) => eq(organizations.ownerId, userId),
  });

  if (!org) {
    console.error('Organization not found');
    return;
  }

  // Get subscription details
  const stripeSubscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // Create or update subscription record
  await db
    .insert(subscriptions)
    .values({
      organizationId: org.id,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0].price.id,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    })
    .onConflictDoUpdate({
      target: subscriptions.organizationId,
      set: {
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0].price.id,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        updatedAt: new Date(),
      },
    });

  // Update organization plan
  const planLimits = {
    starter: { limit: 500, inboxes: 1 },
    pro: { limit: 2000, inboxes: 5 },
    business: { limit: -1, inboxes: -1 },
  };

  await db
    .update(organizations)
    .set({
      plan,
      monthlyMessageLimit: planLimits[plan].limit,
      inboxLimit: planLimits[plan].inboxes,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, org.id));
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await db
    .update(subscriptions)
    .set({
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const sub = await db.query.subscriptions.findFirst({
    where: (subscriptions, { eq }) =>
      eq(subscriptions.stripeSubscriptionId, subscription.id),
  });

  if (sub) {
    // Downgrade to starter plan
    await db
      .update(organizations)
      .set({
        plan: 'starter',
        monthlyMessageLimit: 500,
        inboxLimit: 1,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, sub.organizationId));

    // Update subscription status
    await db
      .update(subscriptions)
      .set({
        status: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, sub.id));
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Send email notification or handle payment failure
  console.log('Payment failed for invoice:', invoice.id);
  // TODO: Implement email notification
}
