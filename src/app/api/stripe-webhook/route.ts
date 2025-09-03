import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/connect";
import { createTransporter } from "@/lib/nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const transporter = await createTransporter();
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
    const validPlans = ["trial", "monthly", "annual", "test"];
    if (!validPlans.includes(plan)) {
      console.error(`Invalid plan: ${plan}`);
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
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
      const subscriptionData = await prisma.subscription.upsert({
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

      // Send email to admin
      await transporter.sendMail({
        from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "New Paid Subscription",
        text: `
          A user has created a new paid subscription.
          
          User ID: ${userId}
          Email: ${user.email}
          Plan: ${plan}
          Subscription ID: ${subscriptionId}
          Start Date: ${new Date().toLocaleString()}
          Renewal Date: ${
            subscriptionData.renewalDate?.toLocaleString() ?? "N/A"
          }
        `,
        html: `
          <h2>New Paid Subscription</h2>
          <p><strong>User ID:</strong> ${userId}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Plan:</strong> ${plan}</p>
          <p><strong>Subscription ID:</strong> ${subscriptionId}</p>
          <p><strong>Start Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Renewal Date:</strong> ${
            subscriptionData.renewalDate?.toLocaleString() ?? "N/A"
          }</p>
        `,
      });

      // Send confirmation email to user
      await transporter.sendMail({
        from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: "Welcome to Your Paid Subscription!",
        text: `
          Hi,

          Your ${plan} subscription has been successfully activated!
          
          Plan: ${plan}
          Start Date: ${new Date().toLocaleString()}
          Renewal Date: ${
            subscriptionData.renewalDate?.toLocaleString() ?? "N/A"
          }
          
          Thank you for choosing IUL Calculator Pro!
        `,
        html: `
          <h2>Welcome to Your Paid Subscription!</h2>
          <p>Your <strong>${plan}</strong> subscription has been successfully activated!</p>
          <p><strong>Plan:</strong> ${plan}</p>
          <p><strong>Start Date:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Renewal Date:</strong> ${
            subscriptionData.renewalDate?.toLocaleString() ?? "N/A"
          }</p>
          <p>Thank you for choosing IUL Calculator Pro!</p>
        `,
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
      const subscriptionData = await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: subscription.status,
          renewalDate: subscription.items.data[0]?.current_period_end
            ? new Date(subscription.items.data[0]?.current_period_end * 1000)
            : null,
          updatedAt: new Date(),
        },
      });
      console.log(subscriptionData);

      // Fetch user for email
      const sub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        select: { userId: true, user: { select: { email: true } } },
      });

      if (sub?.user?.email) {
        // Send email to admin
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: `Subscription ${
            event.type === "customer.subscription.updated"
              ? "Updated"
              : "Deleted"
          }`,
          text: `
            A subscription has been ${
              event.type === "customer.subscription.updated"
                ? "updated"
                : "deleted"
            }.
            
            User ID: ${sub.userId}
            Email: ${sub.user.email}
            Subscription ID: ${subscription.id}
            Status: ${subscription.status}
            Updated At: ${new Date().toLocaleString()}
            Renewal Date: ${
              subscription.items.data[0]?.current_period_end
                ? new Date(
                    subscription.items.data[0].current_period_end * 1000
                  ).toLocaleString()
                : "N/A"
            }
          `,
          html: `
            <h2>Subscription ${
              event.type === "customer.subscription.updated"
                ? "Updated"
                : "Deleted"
            }</h2>
            <p><strong>User ID:</strong> ${sub.userId}</p>
            <p><strong>Email:</strong> ${sub.user.email}</p>
            <p><strong>Subscription ID:</strong> ${subscription.id}</p>
            <p><strong>Status:</strong> ${subscription.status}</p>
            <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Renewal Date:</strong> ${
              subscription.items.data[0]?.current_period_end
                ? new Date(
                    subscription.items.data[0].current_period_end * 1000
                  ).toLocaleString()
                : "N/A"
            }</p>
          `,
        });

        // Send email to user
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: sub.user.email,
          subject: `Your Subscription Has Been ${
            event.type === "customer.subscription.updated"
              ? "Updated"
              : "Cancelled"
          }`,
          text: `
            Hi,

            Your subscription has been ${
              event.type === "customer.subscription.updated"
                ? "updated"
                : "cancelled"
            }.
            
            Subscription ID: ${subscription.id}
            Status: ${subscription.status}
            Updated At: ${new Date().toLocaleString()}
            Renewal Date: ${
              subscription.items.data[0]?.current_period_end
                ? new Date(
                    subscription.items.data[0].current_period_end * 1000
                  ).toLocaleString()
                : "N/A"
            }
            
            Thank you for using IUL Calculator Pro!
          `,
          html: `
            <h2>Your Subscription Has Been ${
              event.type === "customer.subscription.updated"
                ? "Updated"
                : "Cancelled"
            }</h2>
            <p>Your subscription has been ${
              event.type === "customer.subscription.updated"
                ? "updated"
                : "cancelled"
            }.</p>
            <p><strong>Subscription ID:</strong> ${subscription.id}</p>
            <p><strong>Status:</strong> ${subscription.status}</p>
            <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Renewal Date:</strong> ${
              subscription.items.data[0]?.current_period_end
                ? new Date(
                    subscription.items.data[0].current_period_end * 1000
                  ).toLocaleString()
                : "N/A"
            }</p>
            <p>Thank you for using IUL Calculator Pro!</p>
          `,
        });
      }

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
