// src/app/api/subscriptions/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      select: {
        userId: true,
        status: true,
        planType: true,
        renewalDate: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(
      subscriptions.map((sub) => ({
        userId: sub.userId,
        status: sub.status,
        planType: sub.planType,
        endDate: sub.renewalDate?.toISOString(),
        userEmail: sub.user.email,
        userName:
          `${sub.user.firstName || ""} ${sub.user.lastName || ""}`.trim() ||
          "Unknown",
      }))
    );
  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
