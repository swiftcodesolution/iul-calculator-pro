// src/app/api/subscription/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    });

    const isSubscriptionExpired =
      subscription?.status === "trialing" &&
      subscription?.renewalDate &&
      new Date(subscription.renewalDate) < new Date();

    const status =
      isSubscriptionExpired || subscription?.status !== "active"
        ? "inactive"
        : "active";

    const response = NextResponse.json({ status });
    response.cookies.set("subscription-status", status, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 3600,
    });
    return response;
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
