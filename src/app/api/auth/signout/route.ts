import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/connect";

const tokenBlacklist = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionToken = req.headers
      .get("cookie")
      ?.split("; ")
      .find((cookie) => cookie.startsWith("next-auth.session-token="))
      ?.split("=")[1];

    if (!sessionToken) {
      return NextResponse.json(
        { error: "No session token found" },
        { status: 401 }
      );
    }

    console.log("Signout request:", { sessionToken });

    await prisma.session.deleteMany({
      where: { sessionToken },
    });

    await prisma.sessionHistory.updateMany({
      where: { sessionToken, logoutAt: null },
      data: { logoutAt: new Date() },
    });

    const response = NextResponse.json({ message: "Signed out successfully" });
    response.headers.set(
      "Set-Cookie",
      "next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );

    return response;
  } catch (error) {
    console.error("Sign-out error:", error);

    const message =
      error instanceof Error ? error.message : "Sign-out process failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  return tokenBlacklist.has(token);
}
