import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CustomUser } from "@/lib/next-auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  let userId: string;
  let userData: CustomUser | null = null;

  if (session?.user?.id) {
    userId = session.user.id;
    userData = session.user as CustomUser;
  } else {
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const jti = authHeader.split(" ")[1];
      const sessionRecord = await prisma.session.findFirst({
        where: { sessionToken: jti },
        include: { user: true },
      });
      if (!sessionRecord || sessionRecord.expires < new Date()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userData = {
        id: sessionRecord.user.id,
        email: sessionRecord.user.email,
        role: sessionRecord.user.role,
        status: sessionRecord.user.status,
        firstName: sessionRecord.user.firstName ?? undefined,
        lastName: sessionRecord.user.lastName ?? undefined,
        subscriptionStatus: undefined,
      };
      userId = sessionRecord.user.id;
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      include: { iulSales: { where: { verified: true } } }, // Include verified IUL sales
    });

    let status: string;

    if (!subscription) {
      status = "none";
    } else if (
      subscription.status === "trialing" &&
      subscription.renewalDate &&
      new Date(subscription.renewalDate) < new Date() &&
      subscription.iulSales.length === 0
    ) {
      // Trial expired and no verified sales
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "expired", updatedAt: new Date() },
      });
      status = "expired";
    } else if (
      subscription.iulSales.length > 0 &&
      subscription.status !== "active"
    ) {
      // Grant free access for verified IUL sales
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "active", updatedAt: new Date() },
      });
      status = "active";
    } else {
      // Use existing subscription status (e.g., active, canceled, pending)
      status = subscription.status;
    }

    if (userData) {
      userData.subscriptionStatus = status;
    }

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
