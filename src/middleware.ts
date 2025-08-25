import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth?.token;
    const sessionToken = req.cookies.get("next-auth.session-token")?.value;
    const userRole = req.cookies.get("user-role")?.value || "user";
    const subscriptionStatus = req.cookies.get("subscription-status")?.value;

    // Log for debugging
    console.log("Middleware:", {
      pathname,
      isAuthenticated: !!token,
      role: token?.role,
      status: token?.status,
      sessionToken,
    });

    // Redirect unauthenticated users
    if (!token && !sessionToken) {
      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin/dashboard")
      ) {
        const redirectUrl = new URL(
          userRole === "admin" ? "/admin" : "/",
          req.url
        );
        redirectUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Check subscription status from cookie
    if (
      token &&
      (token.status === "suspended" || subscriptionStatus !== "active")
    ) {
      const redirectUrl = new URL("/subscribe", req.url);
      redirectUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Allow access to public pages
    if (
      pathname === "/" ||
      pathname === "/admin" ||
      pathname === "/subscribe"
    ) {
      if (token) {
        const redirectPath =
          token.role === "admin" ? "/admin/dashboard" : "/dashboard/home";
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
      return NextResponse.next();
    }

    // Protect dashboard routes
    if (
      !token &&
      (pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin/dashboard"))
    ) {
      const redirectUrl = new URL("/", req.url);
      redirectUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;
        const subscriptionStatus = req.cookies.get(
          "subscription-status"
        )?.value;

        // Allow public pages
        if (
          pathname === "/" ||
          pathname === "/admin" ||
          pathname === "/subscribe"
        ) {
          return true;
        }

        // Protect dashboard routes
        if (pathname.startsWith("/dashboard")) {
          return (
            !!token &&
            token.role === "agent" &&
            token.status === "active" &&
            subscriptionStatus === "active"
          );
        }

        // Protect admin dashboard routes
        if (pathname.startsWith("/admin/dashboard")) {
          return (
            !!token &&
            token.role === "admin" &&
            token.status === "active" &&
            subscriptionStatus === "active"
          );
        }

        return false;
      },
    },
    pages: { signIn: "/" },
  }
);

export const config = {
  matcher: ["/", "/admin", "/dashboard/:path*", "/admin/:path*", "/subscribe"],
};
