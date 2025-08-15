/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import prisma from "@/lib/connect";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";
import { syncToZohoCRM } from "@/lib/zoho";

// Define interface for syncToZohoCRM parameters
interface ZohoUserData {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  iulCalculatorProLead?: string;
  subscriptionPlan?: string;
  stripeCustomerId: string; // Changed to allow null
  stripeSubscriptionId?: string;
  agentName?: string; // Added for Agent_Name
  createdBy?: string; // Added for Created_By
  owner?: string; // Added for Owner
}

interface ZohoSubscriptionData {
  planType: string;
  stripeCustomerId: string; // Changed to allow null
  stripeSubscriptionId: string;
  startDate?: string; // Added formatted date string (YYYY-MM-DD)
  renewalDate?: string; // Added formatted date string (YYYY-MM-DD)
}

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

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      cellPhone: true,
      officePhone: true,
      createdAt: true,
      role: true,
    },
  });
  if (!user) {
    console.error("User not found:", session.user.id);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  console.log("User data fetched:", {
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const trialToken = await prisma.trialToken.findUnique({
    where: { userId: session.user.id },
  });
  console.log("Trial token check:", trialToken ? "Found" : "Not found");

  const logEmailAttempt = async (
    emailType: string,
    recipient: string,
    subject: string,
    status: string,
    errorMessage?: string,
    subscriptionId?: string
  ) => {
    try {
      await prisma.emailLog.create({
        data: {
          userId: user.id,
          subscriptionId,
          emailType,
          recipient,
          subject,
          status,
          errorMessage,
          sentAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log(`Email log created: ${emailType} to ${recipient}`);
    } catch (logError: any) {
      console.error(`Failed to log email attempt for ${emailType}:`, {
        message: logError.message,
      });
    }
  };

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
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }),
        prisma.trialToken.create({
          data: {
            userId: session.user.id,
            token: randomUUID(),
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
          },
        }),
      ]);
      console.log("Subscription created:", subscription.id);

      try {
        console.log("Attempting Zoho CRM sync");
        await syncToZohoCRM(
          {
            id: user.id,
            email: user.email,
            name: `${user.firstName ?? "first name"} ${
              user.lastName ?? "last name"
            }`,
            firstName: user.firstName ?? "first name",
            lastName: user.lastName ?? "last name",
            iulCalculatorProLead: "iul calculator pro lead",
            subscriptionPlan: plan,
            stripeCustomerId: "", // Changed from "" to null
            stripeSubscriptionId: `trial-${user.id}`,
            agentName: user.firstName ?? "Unknown", // Added for Agent_Name
            createdBy: "System", // Added for Created_By
            owner: "System", // Added for Owner
          } as ZohoUserData,
          {
            planType: plan,
            stripeCustomerId: "", // Changed from "" to null
            stripeSubscriptionId: `trial-${user.id}`,
            startDate: subscription.startDate.toISOString().split("T")[0], // Added formatted date
            renewalDate: subscription.renewalDate?.toISOString().split("T")[0], // Added formatted date
          } as ZohoSubscriptionData
        );
        console.log("Zoho CRM sync completed successfully");
      } catch (zohoError: any) {
        console.error("Zoho sync failed, continuing with trial activation:", {
          message: zohoError.message,
          response: zohoError.response?.data,
          details: zohoError.response?.data?.details, // Added detailed logging
          status: zohoError.response?.status,
        });
        // Continue despite Zoho failure
      }

      const adminSubject = "New User Signup and Trial Subscription";
      try {
        console.log("Sending admin signup and trial email");
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: adminSubject,
          text: `
            A new user has signed up and activated a trial subscription.
            
            User ID: ${user.id}
            Name: ${user.firstName} ${user.lastName}
            Email: ${user.email}
            Cell Phone: ${user.cellPhone}
            Office Phone: ${user.officePhone}
            Signed Up At: ${
              user.createdAt ? user.createdAt.toLocaleString() : "Not available"
            }
            Plan: ${plan}
            Start Date: ${new Date().toLocaleString()}
            Renewal Date: ${subscription.renewalDate?.toLocaleString()}
          `,
          html: `
            <h2>New User Signup and Trial Subscription</h2>
            <p><strong>User ID:</strong> ${user.id}</p>
            <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Cell Phone:</strong> ${user.cellPhone}</p>
            <p><strong>Office Phone:</strong> ${user.officePhone}</p>
            <p><strong>Signed Up At:</strong> ${
              user.createdAt ? user.createdAt.toLocaleString() : "Not available"
            }</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Start Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Renewal Date:</strong> ${subscription.renewalDate?.toLocaleString()}</p>
          `,
        });
        console.log("Admin signup and trial email sent successfully");
        await logEmailAttempt(
          "signup_trial",
          process.env.ADMIN_EMAIL!,
          adminSubject,
          "sent",
          undefined,
          subscription.id
        );
      } catch (emailError: any) {
        console.error("Admin signup and trial email failed:", {
          message: emailError.message,
          code: emailError.code,
        });
        await logEmailAttempt(
          "signup_trial",
          process.env.ADMIN_EMAIL!,
          adminSubject,
          "failed",
          emailError.message,
          subscription.id
        );
        // Continue despite email failure
      }

      /*
      const userSubject = "Welcome to IUL Calculator Pro - Trial Activated!";
      try {
        console.log("Sending user welcome and trial email");
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: userSubject,
          text: `
            Hi ${user.firstName},
            
            Welcome to IUL Calculator Pro! Your account has been successfully created, and your trial subscription has been activated.
            
            Name: ${user.firstName} ${user.lastName}
            Email: ${user.email}
            Cell Phone: ${user.cellPhone}
            Plan: ${plan}
            Start Date: ${new Date().toLocaleString()}
            Renewal Date: ${subscription.renewalDate?.toLocaleString()}
            
            Thank you for joining us!
          `,
          html: `
            <h2>Welcome to IUL Calculator Pro!</h2>
            <p>Hi ${user.firstName},</p>
            <p>Your account has been successfully created, and your trial subscription has been activated.</p>
            <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Cell Phone:</strong> ${user.cellPhone}</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Start Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Renewal Date:</strong> ${subscription.renewalDate?.toLocaleString()}</p>
            <p>Thank you for joining us!</p>
          `,
        });
        console.log("User welcome and trial email sent successfully");
        await logEmailAttempt(
          "signup_trial",
          user.email,
          userSubject,
          "sent",
          undefined,
          subscription.id
        );
      } catch (emailError: any) {
        console.error("User welcome and trial email failed:", {
          message: emailError.message,
          code: emailError.code,
        });
        await logEmailAttempt(
          "signup_trial",
          user.email,
          userSubject,
          "failed",
          emailError.message,
          subscription.id
        );
        // Continue despite email failure
      }
      */

      const userSubject = "Welcome to Calculator Pro – You’re In!";
      try {
        console.log("Sending user welcome and trial email");
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: userSubject,
          text: `
      Hi ${user.firstName},

      Welcome aboard! You now have full access to IUL Calculator Pro—our premium training and illustration tool built to help you close IUL sales with confidence.

      Here’s the deal: You're on a 60-day complimentary trial. To keep Pro for free, you must:
      1. Submit one IUL sale under our agency (TruChoice Financial)
      2. Tell Shawn Van Stratten that you’re joining through "IUL Calculator Pro"—this step is required to qualify.

      If no sale is submitted within 60 days, continued access is available for:
      · $100/month, or
      · $1,000/year (one-time payment)

      To get appointed and stay eligible: 
      📧 svanstratten@truchoicefinancial.com 
      📞 561.472.9792 
      🧾 Available Carriers: Allianz, Minnesota Life, LSW, North American, Nationwide, Penn Mutual, Symetra, Columbus Life 
      ⚠️ Tell Shawn you're signing up under "IUL Calculator Pro" or your trial won't convert to free access.

      ▶️ Watch the training walkthrough here

      We’ll follow up at Day 30 and Day 50 to keep you on track.

      – Steve
    `,
          html: `
      <h2>Welcome to Calculator Pro – You’re In!</h2>
      <p>Hi ${user.firstName},</p>
      <p>Welcome aboard! You now have full access to IUL Calculator Pro—our premium training and illustration tool built to help you close IUL sales with confidence.</p>
      <p>Here’s the deal: You're on a 60-day complimentary trial. To keep Pro for free, you must:</p>
      <ol>
        <li>Submit one IUL sale under our agency (TruChoice Financial)</li>
        <li>Tell Shawn Van Stratten that you’re joining through "IUL Calculator Pro"—this step is required to qualify.</li>
      </ol>
      <p>If no sale is submitted within 60 days, continued access is available for:</p>
      <ul>
        <li>$100/month, or</li>
        <li>$1,000/year (one-time payment)</li>
      </ul>
      <p><strong>To get appointed and stay eligible:</strong></p>
      <p>📧 <a href="mailto:svanstratten@truchoicefinancial.com">svanstratten@truchoicefinancial.com</a><br>
      📞 561.472.9792<br>
      🧾 Available Carriers: Allianz, Minnesota Life, LSW, North American, Nationwide, Penn Mutual, Symetra, Columbus Life<br>
      ⚠️ Tell Shawn you're signing up under "IUL Calculator Pro" or your trial won't convert to free access.</p>
      <p>▶️ Watch the training walkthrough <a href="https://adilo.bigcommand.com/watch/opUQ_aSf">here</a></p>
      <p>We’ll follow up at Day 30 and Day 50 to keep you on track.</p>
      <p>– Steve</p>
    `,
        });
        console.log("User welcome and trial email sent successfully");
        await logEmailAttempt(
          "signup_trial",
          user.email,
          userSubject,
          "sent",
          undefined,
          subscription.id
        );
      } catch (emailError: any) {
        console.error("User welcome and trial email failed:", {
          message: emailError.message,
          code: emailError.code,
        });
        await logEmailAttempt(
          "signup_trial",
          user.email,
          userSubject,
          "failed",
          emailError.message,
          subscription.id
        );
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
      let updatedSubscription;
      if (subscription) {
        updatedSubscription = await prisma.subscription.update({
          where: { id: subscription.id },
          data: { planType: plan, updatedAt: new Date() },
        });
        console.log("Subscription updated:", subscription.id);
      } else {
        updatedSubscription = await prisma.subscription.create({
          data: {
            userId: session.user.id,
            stripeCustomerId: "",
            stripeSubscriptionId: `trial-${session.user.id}`,
            planType: plan,
            status: "trialing",
            startDate: new Date(),
            renewalDate: trialToken.expiresAt,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log("New subscription created for trial");
      }

      try {
        console.log("Attempting Zoho CRM sync for trial update");
        await syncToZohoCRM(
          {
            id: user.id,
            email: user.email,
            name: `${user.firstName ?? "first name"} ${
              user.lastName ?? "last name"
            }`,
            firstName: user.firstName ?? "first name",
            lastName: user.lastName ?? "last name",
            iulCalculatorProLead: "iul calculator pro lead",
            subscriptionPlan: plan,
            stripeCustomerId: "", // Changed from "" to null
            stripeSubscriptionId: `trial-${user.id}`,
            agentName: user.firstName ?? "Unknown", // Added for Agent_Name
            createdBy: "System", // Added for Created_By
            owner: "System", // Added for Owner
          } as ZohoUserData,
          {
            planType: plan,
            stripeCustomerId: "", // Changed from "" to null
            stripeSubscriptionId: `trial-${user.id}`,
            startDate: subscription?.startDate.toISOString().split("T")[0], // Added formatted date
            renewalDate: subscription?.renewalDate?.toISOString().split("T")[0], // Added formatted date
          } as ZohoSubscriptionData
        );
        console.log("Zoho CRM sync completed successfully for trial update");
      } catch (zohoError: any) {
        console.error("Zoho sync failed for trial update, continuing:", {
          message: zohoError.message,
          response: zohoError.response?.data,
          details: zohoError.response?.data?.details, // Added detailed logging
          status: zohoError.response?.status,
        });
        // Continue despite Zoho failure
      }

      const adminSubject = "Trial Plan Updated";
      try {
        console.log("Sending admin email for trial update");
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: adminSubject,
          text: `
            A user has updated their trial subscription plan.
            
            User ID: ${user.id}
            Email: ${user.email}
            Plan: ${plan}
            Updated At: ${new Date().toLocaleString()}
          `,
          html: `
            <h2>Trial Plan Updated</h2>
            <p><strong>User ID:</strong> ${user.id}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
          `,
        });
        console.log("Admin email sent successfully for trial update");
        await logEmailAttempt(
          "trial_update",
          process.env.ADMIN_EMAIL!,
          adminSubject,
          "sent",
          undefined,
          updatedSubscription.id
        );
      } catch (emailError: any) {
        console.error("Admin email failed for trial update:", {
          message: emailError.message,
          code: emailError.code,
        });
        await logEmailAttempt(
          "trial_update",
          process.env.ADMIN_EMAIL!,
          adminSubject,
          "failed",
          emailError.message,
          updatedSubscription.id
        );
        // Continue despite email failure
      }

      const userSubject = "Trial Plan Updated";
      try {
        console.log("Sending user email for trial update");
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: userSubject,
          text: `
            Hi ${user.firstName},
            
            Your trial subscription plan has been updated to ${plan}.
            
            Plan: ${plan}
            Updated At: ${new Date().toLocaleString()}
            
            Thank you for using IUL Calculator Pro!
          `,
          html: `
            <h2>Trial Plan Updated</h2>
            <p>Hi ${user.firstName},</p>
            <p>Your trial subscription plan has been updated to <strong>${plan}</strong>.</p>
            <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
            <p>Thank you for using IUL Calculator Pro!</p>
          `,
        });
        console.log("User email sent successfully for trial update");
        await logEmailAttempt(
          "trial_update",
          user.email,
          userSubject,
          "sent",
          undefined,
          updatedSubscription.id
        );
      } catch (emailError: any) {
        console.error("User email failed for trial update:", {
          message: emailError.message,
          code: emailError.code,
        });
        await logEmailAttempt(
          "trial_update",
          user.email,
          userSubject,
          "failed",
          emailError.message,
          updatedSubscription.id
        );
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
      email: user.email,
      limit: 1,
    });
    const customer: Stripe.Customer =
      customers.data[0] ??
      (await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
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
      metadata: { plan, userId: user.id },
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
      include: { iulSales: { where: { verified: true } } },
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
      new Date(subscription.renewalDate) < new Date() &&
      subscription.iulSales.length === 0;
    console.log(
      "Subscription status:",
      isExpired ? "expired" : subscription.status
    );

    return NextResponse.json({
      status: isExpired ? "expired" : subscription.status,
      planType: subscription.planType,
      endDate: subscription.renewalDate?.toISOString(),
      iulSalesCount: subscription.iulSales.length,
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
