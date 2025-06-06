import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/connect";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessionToken = req.cookies.get("next-auth.session-token")?.value;

    if (sessionToken) {
      await prisma.sessionHistory.updateMany({
        where: {
          userId: session.user.id,
          sessionToken,
          logoutAt: null,
        },
        data: {
          logoutAt: new Date(),
        },
      });
    }

    const response = NextResponse.json({ message: "Signed out successfully" });
    response.headers.set(
      "Set-Cookie",
      "next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );

    return response;
  } catch (error) {
    console.error("Sign-out error:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
