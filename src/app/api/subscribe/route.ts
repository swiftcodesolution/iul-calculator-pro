import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import prisma from "@/lib/connect";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    monthly: "price_1N4P5BDjQSIXuLORTS2bD4Tq", // Replace with test mode monthly price ID
    annual: "price_1NRErKDjQSIXuLORuz78dbiO", // Replace with test mode annual price ID
  };

  if (plan === "trial") {
    try {
      const existingTrial = await prisma.subscription.findFirst({
        where: { userId: session.user.id, planType: "trial" },
      });

      if (existingTrial) {
        return NextResponse.json(
          { error: "Trial already exists" },
          { status: 400 }
        );
      }

      const subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          stripeCustomerId: "",
          stripeSubscriptionId: `trial-${session.user.id}`,
          planType: "trial",
          status: "trialing",
          renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        },
      });

      return NextResponse.json(
        { message: "Trial activated", subscription },
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

  if (!(plan in planIds)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
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
      success_url: `${request.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${request.headers.get("origin")}/dashboard?canceled=true`,
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    });
    return NextResponse.json(subscription || {});
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
