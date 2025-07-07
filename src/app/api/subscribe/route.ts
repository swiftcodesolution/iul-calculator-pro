import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import prisma from "@/lib/connect";
import { randomUUID } from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { plan } = (await request.json()) as {
    plan: "trial" | "monthly" | "annual";
  };
  if (!plan) {
    return NextResponse.json({ error: "Missing plan" }, { status: 400 });
  }

  const validPlans = ["trial", "monthly", "annual"] as const;
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planIds: Record<"monthly" | "annual", string> = {
    monthly: "price_1N4P5BDjQSIXuLORTS2bD4Tq",
    annual: "price_1Rg7qMDjQSIXuLOR5ztX8mdi",
  };

  // Check if user has a trial token
  const trialToken = await prisma.trialToken.findUnique({
    where: { userId: session.user.id },
  });

  // If no trial token exists, create one for new users
  if (!trialToken) {
    try {
      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          stripeCustomerId: "",
          stripeSubscriptionId: `trial-${session.user.id}`,
          planType: plan === "trial" ? "trial" : plan,
          status: "trialing",
          startDate: new Date(),
          renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      });

      await prisma.trialToken.create({
        data: {
          userId: session.user.id,
          token: randomUUID(),
          expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        },
      });

      return NextResponse.json(
        {
          message:
            plan === "trial" ? "Trial activated" : `Plan selected: ${plan}`,
          redirect: "/dashboard/home",
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Trial creation error:", error);
      return NextResponse.json(
        { error: "Failed to activate trial" },
        { status: 500 }
      );
    }
  }

  // Check trial status
  const isTrialActive = trialToken.expiresAt > new Date();

  if (isTrialActive) {
    // Update or create subscription with selected plan
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    });
    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { planType: plan },
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          stripeCustomerId: "",
          stripeSubscriptionId: `trial-${session.user.id}`,
          planType: plan,
          status: "trialing",
          startDate: new Date(),
          renewalDate: trialToken.expiresAt,
        },
      });
    }
    return NextResponse.json(
      { message: `Plan selected: ${plan}`, redirect: "/dashboard/home" },
      { status: 200 }
    );
  }

  // Proceed to Stripe for expired trial and non-trial plans
  if (plan === "trial") {
    return NextResponse.json(
      { error: "Trial period expired, please select a paid plan" },
      { status: 400 }
    );
  }

  try {
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });
    const customer: Stripe.Customer =
      customers.data[0] ??
      (await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id },
      }));

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      success_url: `${request.headers.get(
        "origin"
      )}/dashboard/home?success=true`,
      cancel_url: `${request.headers.get(
        "origin"
      )}/dashboard/home?canceled=true`,
      line_items: [{ price: planIds[plan], quantity: 1 }],
      metadata: { plan, userId: session.user.id },
    });

    return NextResponse.json({ url: checkoutSession.url ?? "" });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return NextResponse.json({ status: "none" });
    }

    const isExpired =
      subscription.status === "trialing" &&
      subscription.renewalDate &&
      new Date(subscription.renewalDate) < new Date();

    return NextResponse.json({
      status: isExpired ? "expired" : subscription.status,
      planType: subscription.planType,
      endDate: subscription.renewalDate?.toISOString(),
    });
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
