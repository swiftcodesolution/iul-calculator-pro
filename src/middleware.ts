import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/connect";

export default withAuth(
  async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth?.token;
    const sessionToken = req.cookies.get("next-auth.session-token")?.value;
    const userRole = req.cookies.get("user-role")?.value;

    console.log("Middleware:", {
      pathname,
      isAuthenticated: !!token,
      role: token?.role,
      status: token?.status,
      sessionToken,
      cookies: req.cookies.getAll(),
    });

    // Check if user is authenticated
    if (!token && !sessionToken) {
      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin/dashboard")
      ) {
        console.log("Redirecting to appropriate login page");
        const redirectUrl = new URL(
          userRole === "admin" ? "/admin" : "/",
          req.url
        );
        redirectUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Check user and subscription status
    if (token) {
      const subscription = await prisma.subscription.findFirst({
        where: { userId: token.id as string },
      });

      const isSubscriptionExpired =
        subscription?.status === "trialing" &&
        subscription?.renewalDate &&
        new Date(subscription.renewalDate) < new Date();

      if (
        token.status === "suspended" ||
        (subscription &&
          (isSubscriptionExpired || subscription.status !== "active"))
      ) {
        console.log(
          "User is suspended or subscription is invalid, redirecting to /subscribe"
        );
        const redirectUrl = new URL("/subscribe", req.url);
        redirectUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Allow unauthenticated access to login and subscribe pages
    if (
      pathname === "/" ||
      pathname === "/admin" ||
      pathname === "/subscribe"
    ) {
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
        const sessionToken = req.cookies.get("next-auth.session-token")?.value;

        console.log("Authorized callback:", {
          pathname,
          role: token?.role,
          status: token?.status,
          sessionToken,
          token: token || "no token",
        });

        // Allow access to login and subscribe pages
        if (
          pathname === "/" ||
          pathname === "/admin" ||
          pathname === "/subscribe"
        ) {
          return true;
        }

        // Check subscription status for protected routes
        if (token) {
          const subscription = await prisma.subscription.findFirst({
            where: { userId: token.id as string },
          });

          const isSubscriptionExpired =
            subscription?.status === "trialing" &&
            subscription?.renewalDate &&
            new Date(subscription.renewalDate) < new Date();

          if (
            token.status === "suspended" ||
            (subscription &&
              (isSubscriptionExpired || subscription.status !== "active"))
          ) {
            return false;
          }
        }

        // Protect dashboard routes
        if (pathname.startsWith("/dashboard")) {
          return (
            !!token && token?.role === "agent" && token?.status === "active"
          );
        }

        // Protect admin dashboard routes
        if (pathname.startsWith("/admin/dashboard")) {
          return (
            !!token && token?.role === "admin" && token?.status === "active"
          );
        }

        return false;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/", "/admin", "/dashboard/:path*", "/admin/:path*", "/subscribe"],
};
