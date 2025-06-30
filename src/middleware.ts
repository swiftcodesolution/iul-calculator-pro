import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/connect";

export default withAuth(
  async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth?.token;
    const sessionToken = req.cookies.get("next-auth.session-token")?.value;

    // Allow unauthenticated access to cron route
    if (pathname === "/api/cron/check-trial-expiration") {
      return NextResponse.next();
    }

    // Check user status for authenticated users
    let userStatus: string | null = null;
    if (token?.sub) {
      const user = await prisma.user.findUnique({
        where: { id: token.sub },
        select: { status: true },
      });
      userStatus = user?.status ?? null;
    }

    console.log("Middleware:", {
      pathname,
      isAuthenticated: !!token,
      role: token?.role,
      sessionToken,
      userStatus,
      cookies: req.cookies.getAll(),
    });

    // Redirect suspended users to /dashboard/subscribe
    if (
      token &&
      userStatus === "suspended" &&
      !pathname.startsWith("/dashboard/subscribe")
    ) {
      console.log("Redirecting suspended user to /dashboard/subscribe");
      const redirectUrl = new URL("/dashboard/subscribe", req.url);
      redirectUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Allow unauthenticated access to login pages
    if (pathname === "/" || pathname === "/admin") {
      if (token) {
        const redirectPath =
          token.role === "admin" ? "/admin/dashboard" : "/dashboard/home";
        console.log(`Redirecting to ${redirectPath}`);
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
      return NextResponse.next();
    }

    // Redirect unauthenticated users from protected routes
    if (
      !token &&
      (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin/dashboard"))
    ) {
      console.log("Redirecting to /");
      const redirectUrl = new URL("/", req.url);
      redirectUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: async ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        // Allow cron route
        if (pathname === "/api/cron/check-trial-expiration") {
          return true;
        }

        // Allow access to login pages
        if (pathname === "/" || pathname === "/admin") {
          return true;
        }

        // Check user status for dashboard routes
        if (pathname.startsWith("/dashboard")) {
          if (!token) return false;
          const user = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { status: true, role: true },
          });
          return !!user && user.status !== "suspended" && user.role === "agent";
        }

        // Protect admin dashboard routes
        if (pathname.startsWith("/admin/dashboard")) {
          return !!token && token.role === "admin";
        }

        return false;
      },
    },
    pages: {
      signIn: "/",
      error: "/dashboard/subscribe",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/admin",
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/cron/check-trial-expiration",
  ],
};
