/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import prisma from "@/lib/connect";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";
import { syncToZohoCRM } from "@/lib/zoho";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  console.log("POST /api/subscribe started");

  // Validate environment variables
  const requiredEnvVars = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "ADMIN_EMAIL",
    "STRIPE_SECRET_KEY",
    "ZOHO_CLIENT_ID",
    "ZOHO_CLIENT_SECRET",
    "ZOHO_REFRESH_TOKEN",
  ];
  const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  if (missingEnvVars.length > 0) {
    console.error("Missing environment variables:", missingEnvVars);
    return NextResponse.json(
      { error: `Missing environment variables: ${missingEnvVars.join(", ")}` },
      { status: 500 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("Unauthorized: No session or user ID");
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  console.log("Session validated for user:", session.user.id);

  const { plan } = (await request.json()) as {
    plan: "trial" | "monthly" | "annual";
  };
  if (!plan) {
    console.error("Missing plan in request body");
    return NextResponse.json({ error: "Missing plan" }, { status: 400 });
  }
  console.log("Plan received:", plan);

  const validPlans = ["trial", "monthly", "annual"] as const;
  if (!validPlans.includes(plan)) {
    console.error("Invalid plan:", plan);
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planIds: Record<"monthly" | "annual", string> = {
    monthly: "price_1RbOCrDjQSIXuLORKqGFNe0Y",
    annual: "price_1RbR2ADjQSIXuLORFc9tlyfY",
  };

  const user = {
    id: session.user.id,
    iulCalculatorProLead: "iul calculator pro lead",
    email: session.user.email!,
    firstName: session.user.firstName ?? "first name",
    lastName: session.user.lastName ?? "last name",
    subscriptionPlan: "subscription plan",
    stripeCustomerId: "stripe customer id",
    stripeSubscriptionId: "stripe subscription id",
  };
  console.log("User data prepared:", user);

  const trialToken = await prisma.trialToken.findUnique({
    where: { userId: session.user.id },
  });
  console.log("Trial token check:", trialToken ? "Found" : "Not found");

  if (!trialToken) {
    try {
      console.log("Creating new trial subscription and token");
      const [subscription] = await prisma.$transaction([
        prisma.subscription.create({
          data: {
            userId: session.user.id,
            stripeCustomerId: "",
            stripeSubscriptionId: `trial-${session.user.id}`,
            planType: plan === "trial" ? "trial" : plan,
            status: "trialing",
            startDate: new Date(),
            renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          },
        }),
        prisma.trialToken.create({
          data: {
            userId: session.user.id,
            token: randomUUID(),
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);
      console.log("Subscription created:", subscription.id);

      try {
        console.log("Attempting Zoho CRM sync");
        await syncToZohoCRM(user, {
          planType: subscription.planType,
          stripeCustomerId: subscription.stripeCustomerId ?? "",
          stripeSubscriptionId: subscription.stripeSubscriptionId,
        });
        console.log("Zoho CRM sync completed successfully");
      } catch (zohoError: any) {
        console.error("Zoho sync failed, continuing with trial activation:", {
          message: zohoError.message,
          response: zohoError.response?.data,
          status: zohoError.response?.status,
        });
        // Continue despite Zoho failure
      }

      try {
        console.log("Sending admin email");
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: "New Trial Subscription",
          text: `
            A user has activated a trial subscription.
            
            User ID: ${session.user.id}
            Email: ${session.user.email}
            Plan: ${plan}
            Start Date: ${new Date().toLocaleString()}
            Renewal Date: ${subscription.renewalDate?.toLocaleString()}
          `,
          html: `
            <h2>New Trial Subscription</h2>
            <p><strong>User ID:</strong> ${session.user.id}</p>
            <p><strong>Email:</strong> ${session.user.email}</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Start Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Renewal Date:</strong> ${subscription.renewalDate?.toLocaleString()}</p>
          `,
        });
        console.log("Admin email sent successfully");
      } catch (emailError: any) {
        console.error("Admin email failed:", {
          message: emailError.message,
          code: emailError.code,
        });
        // Continue despite email failure
      }

      try {
        console.log("Sending user email");
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: session.user.email,
          subject: "Welcome to Your Trial Subscription!",
          text: `
            Hi,
            
            Your trial subscription has been activated!
            
            Plan: ${plan}
            Start Date: ${new Date().toLocaleString()}
            Renewal Date: ${subscription.renewalDate?.toLocaleString()}
            
            Thank you for choosing IUL Calculator Pro!
          `,
          html: `
            <h2>Welcome to Your Trial Subscription!</h2>
            <p>Your trial subscription has been activated!</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Start Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Renewal Date:</strong> ${subscription.renewalDate?.toLocaleString()}</p>
            <p>Thank you for choosing IUL Calculator Pro!</p>
          `,
        });
        console.log("User email sent successfully");
      } catch (emailError: any) {
        console.error("User email failed:", {
          message: emailError.message,
          code: emailError.code,
        });
        // Continue despite email failure
      }

      console.log("Trial activation completed successfully");
      return NextResponse.json(
        {
          message:
            plan === "trial" ? "Trial activated" : `Plan selected: ${plan}`,
          redirect: "/dashboard/home",
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Trial creation error:", {
        message: error.message,
        stack: error.stack,
        prismaError: error.code ? { code: error.code, meta: error.meta } : null,
      });
      return NextResponse.json(
        { error: "Failed to activate trial or sync with Zoho" },
        { status: 500 }
      );
    }
  }

  const isTrialActive = trialToken.expiresAt > new Date();
  console.log("Trial active status:", isTrialActive);

  if (isTrialActive) {
    try {
      console.log("Updating trial subscription");
      const subscription = await prisma.subscription.findFirst({
        where: { userId: session.user.id },
      });
      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { planType: plan },
        });
        console.log("Subscription updated:", subscription.id);
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
        console.log("New subscription created for trial");
      }

      try {
        console.log("Attempting Zoho CRM sync for trial update");
        await syncToZohoCRM(user, {
          planType: plan,
          stripeCustomerId: "",
          stripeSubscriptionId: `trial-${session.user.id}`,
        });
        console.log("Zoho CRM sync completed successfully for trial update");
      } catch (zohoError: any) {
        console.error("Zoho sync failed for trial update, continuing:", {
          message: zohoError.message,
          response: zohoError.response?.data,
          status: zohoError.response?.status,
        });
        // Continue despite Zoho failure
      }

      try {
        console.log("Sending admin email for trial update");
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: "Trial Plan Updated",
          text: `
            A user has updated their trial subscription plan.
            
            User ID: ${session.user.id}
            Email: ${session.user.email}
            Plan: ${plan}
            Updated At: ${new Date().toLocaleString()}
          `,
          html: `
            <h2>Trial Plan Updated</h2>
            <p><strong>User ID:</strong> ${session.user.id}</p>
            <p><strong>Email:</strong> ${session.user.email}</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
          `,
        });
        console.log("Admin email sent successfully for trial update");
      } catch (emailError: any) {
        console.error("Admin email failed for trial update:", {
          message: emailError.message,
          code: emailError.code,
        });
        // Continue despite email failure
      }

      try {
        console.log("Sending user email for trial update");
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: session.user.email,
          subject: "Trial Plan Updated",
          text: `
            Hi,
            
            Your trial subscription plan has been updated to ${plan}.
            
            Plan: ${plan}
            Updated At: ${new Date().toLocaleString()}
            
            Thank you for using IUL Calculator Pro!
          `,
          html: `
            <h2>Trial Plan Updated</h2>
            <p>Your trial subscription plan has been updated to <strong>${plan}</strong>.</p>
            <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
            <p>Thank you for using IUL Calculator Pro!</p>
          `,
        });
        console.log("User email sent successfully for trial update");
      } catch (emailError: any) {
        console.error("User email failed for trial update:", {
          message: emailError.message,
          code: emailError.code,
        });
        // Continue despite email failure
      }

      console.log("Trial update completed successfully");
      return NextResponse.json(
        { message: `Plan selected: ${plan}`, redirect: "/dashboard/home" },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Trial update error:", {
        message: error.message,
        stack: error.stack,
        prismaError: error.code ? { code: error.code, meta: error.meta } : null,
      });
      return NextResponse.json(
        { error: "Failed to update trial or sync with Zoho" },
        { status: 500 }
      );
    }
  }

  if (plan === "trial") {
    console.error("Trial period expired for user:", session.user.id);
    return NextResponse.json(
      { error: "Trial period expired, please select a paid plan" },
      { status: 400 }
    );
  }

  try {
    console.log("Creating Stripe checkout session for paid plan");
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
    console.log("Stripe customer:", customer.id);

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
    console.log("Stripe checkout session created:", checkoutSession.id);

    return NextResponse.json({ url: checkoutSession.url ?? "" });
  } catch (error: any) {
    console.error("Checkout session error:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("GET /api/subscribe started");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("Unauthorized: No session or user ID");
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  console.log("Session validated for user:", session.user.id);

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    });
    console.log(
      "Subscription fetched:",
      subscription ? subscription.id : "None"
    );

    if (!subscription) {
      return NextResponse.json({ status: "none" });
    }

    const isExpired =
      subscription.status === "trialing" &&
      subscription.renewalDate &&
      new Date(subscription.renewalDate) < new Date();
    console.log(
      "Subscription status:",
      isExpired ? "expired" : subscription.status
    );

    return NextResponse.json({
      status: isExpired ? "expired" : subscription.status,
      planType: subscription.planType,
      endDate: subscription.renewalDate?.toISOString(),
    });
  } catch (error: any) {
    console.error("Subscription fetch error:", {
      message: error.message,
      stack: error.stack,
      prismaError: error.code ? { code: error.code, meta: error.meta } : null,
    });
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
