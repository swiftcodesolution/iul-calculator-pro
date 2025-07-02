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
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, plan } = session.metadata ?? {};

    if (!userId || !plan) {
      console.error("Missing metadata: userId or plan");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const subscriptionId = session.subscription as string;

    try {
      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: subscriptionId },
        update: {
          status: "active",
          planType: plan,
          stripeCustomerId: session.customer as string,
          userId,
          startDate: new Date(),
          renewalDate: null, // Set based on Stripe subscription
        },
        create: {
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          planType: plan,
          status: "active",
          startDate: new Date(),
        },
      });
      console.log(
        `Subscription created/updated for userId: ${userId}, plan: ${plan}`
      );
    } catch (error) {
      console.error("Subscription upsert error:", error);
      return NextResponse.json(
        { error: "Failed to process subscription" },
        { status: 500 }
      );
    }
  } else if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription & {
      current_period_end?: number;
    };

    try {
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status,
          renewalDate: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
        },
      });
      console.log(
        `Subscription updated: ${subscription.id}, status: ${subscription.status}`
      );
    } catch (error) {
      console.error("Subscription update error:", error);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
