import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/connect";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const buf = await request.arrayBuffer();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook verification failed:", errorMessage);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Check for duplicate webhook processing
  const eventId = event.id;
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eventId },
  });
  if (existingEvent) {
    console.log(`Duplicate webhook event ignored: ${eventId}`);
    return NextResponse.json({ received: true });
  }

  // Store event ID to prevent reprocessing
  await prisma.webhookEvent.create({
    data: { eventId, processedAt: new Date() },
  });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, plan } = session.metadata ?? {};

    // Validate metadata
    if (!userId || !plan) {
      console.error("Missing metadata: userId or plan");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    // Validate plan against schema
    const validPlans = ["trial", "monthly", "annual"];
    if (!validPlans.includes(plan)) {
      console.error(`Invalid plan: ${plan}`);
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    // Validate user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.error(`User not found: ${userId}`);
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const subscriptionId = session.subscription as string;
    const subscriptionResponse = await stripe.subscriptions.retrieve(
      subscriptionId
    );
    const subscription = subscriptionResponse as Stripe.Subscription;

    try {
      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: subscriptionId },
        update: {
          status: "active",
          planType: plan,
          stripeCustomerId: session.customer as string,
          userId,
          startDate: new Date(),
          renewalDate: subscription.items.data[0]?.current_period_end
            ? new Date(subscription.items.data[0]?.current_period_end * 1000)
            : null,
          updatedAt: new Date(),
        },
        create: {
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          planType: plan,
          status: "active",
          startDate: new Date(),
          renewalDate: subscription.items.data[0]?.current_period_end
            ? new Date(subscription.items.data[0]?.current_period_end * 1000)
            : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(
        `Subscription created/updated for userId: ${userId}, plan: ${plan}`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Subscription upsert error:", errorMessage);
      return NextResponse.json(
        { error: "Failed to process subscription", details: errorMessage },
        { status: 500 }
      );
    }
  } else if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;

    try {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status,
          renewalDate: subscription.items.data[0]?.current_period_end
            ? new Date(subscription.items.data[0]?.current_period_end * 1000)
            : null,
          updatedAt: new Date(),
        },
      });
      console.log(
        `Subscription updated: ${subscription.id}, status: ${subscription.status}`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Subscription update error:", errorMessage);
      return NextResponse.json(
        { error: "Failed to update subscription", details: errorMessage },
        { status: 500 }
      );
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
