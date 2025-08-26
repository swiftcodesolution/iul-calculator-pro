import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/connect";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Fetch subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    });

    // Fetch or create trial token
    let trialToken = await prisma.trialToken.findUnique({
      where: { userId: session.user.id },
    });

    // Logic to update TrialToken based on Subscription status
    if (!subscription) {
      // No subscription: trial status is "none" and no trial token
      if (trialToken) {
        await prisma.trialToken.delete({ where: { id: trialToken.id } });
      }
      return NextResponse.json({ status: "none" });
    }

    if (subscription.status === "active") {
      // Active subscription: extend or keep trial active
      if (!trialToken) {
        trialToken = await prisma.trialToken.create({
          data: {
            userId: session.user.id,
            token: Math.random().toString(36).substring(2),
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          },
        });
      } else if (trialToken.expiresAt < new Date()) {
        // Extend trial if expired
        await prisma.trialToken.update({
          where: { id: trialToken.id },
          data: { expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
        });
      }
      return NextResponse.json({ status: "active" });
    }

    if (
      subscription.status === "expired" ||
      (subscription.status === "trialing" &&
        subscription.renewalDate &&
        new Date(subscription.renewalDate) < new Date())
    ) {
      // Expired subscription or trial past renewal date
      if (trialToken && trialToken.expiresAt > new Date()) {
        // Mark trial as expired
        await prisma.trialToken.update({
          where: { id: trialToken.id },
          data: { expiresAt: new Date() }, // Set to now to mark as expired
        });
      } else if (!trialToken) {
        // Create expired trial token for consistency
        trialToken = await prisma.trialToken.create({
          data: {
            userId: session.user.id,
            token: Math.random().toString(36).substring(2),
            expiresAt: new Date(), // Already expired
          },
        });
      }
      return NextResponse.json({ status: "expired" });
    }

    // Default: Use existing trial token status
    if (!trialToken) {
      return NextResponse.json({ status: "none" });
    }

    const isExpired = trialToken.expiresAt < new Date();
    return NextResponse.json({ status: isExpired ? "expired" : "active" });
  } catch (error) {
    console.error("Error fetching/updating trial status:", error);
    return NextResponse.json(
      { error: "Failed to fetch trial status" },
      { status: 500 }
    );
  }
}
