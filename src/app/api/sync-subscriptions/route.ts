import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { v4 as uuidv4 } from "uuid"; // Install uuid: npm install uuid

export async function POST() {
  try {
    // Optional: Secure the endpoint
    // const secret = request.headers.get('x-sync-secret');
    // if (secret !== process.env.SYNC_SECRET) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Fetch all users with their subscriptions
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        Subscription: true,
      },
    });

    console.log(`Found ${users.length} users.`);

    // Identify users without a subscription
    const usersWithoutSubscription = users.filter(
      (user) => user.Subscription.length === 0
    );

    console.log(
      `Found ${usersWithoutSubscription.length} users without a subscription.`
    );

    // Create subscriptions for users without one
    for (const user of usersWithoutSubscription) {
      console.log(
        `Creating subscription for user: ${user.email} (ID: ${user.id})`
      );

      await prisma.subscription.create({
        data: {
          userId: user.id,
          stripeCustomerId: null, // Optional field, can be null
          stripeSubscriptionId: `trial_${uuidv4()}`, // Generate unique ID for trial
          planType: "trial",
          status: "trialing",
          startDate: new Date(),
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      {
        message: "Subscription sync completed successfully",
        usersProcessed: usersWithoutSubscription.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing users with subscriptions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
