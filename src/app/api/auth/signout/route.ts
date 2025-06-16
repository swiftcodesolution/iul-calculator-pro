import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/connect";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const sessionToken = req.headers
      .get("cookie")
      ?.split("; ")
      .find((cookie) => cookie.startsWith("next-auth.session-token="))
      ?.split("=")[1];

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/", req.url));
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

    const cookies = req.headers.get("cookie")?.split("; ") || [];
    cookies.forEach((cookie) => {
      const cookieName = cookie.split("=")[0];
      response.headers.append(
        "Set-Cookie",
        `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
      );
    });

    // Redirect based on user role or URL
    const isAdmin =
      session.user.role === "admin" ||
      req.nextUrl.pathname.startsWith("/admin");
    const redirectPath = isAdmin ? "/admin" : "/";
    return NextResponse.redirect(new URL(redirectPath, req.url));
  } catch (error) {
    console.error("Sign-out error:", error);

    const message =
      error instanceof Error ? error.message : "Sign-out process failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
