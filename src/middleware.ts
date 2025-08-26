import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth?.token;

    // Prevent redirect loops and clear callbackUrl
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) {
      const url = new URL(
        token?.role === "admin"
          ? "/admin/dashboard"
          : token?.role === "agent" &&
            (token.subscriptionStatus === "active" ||
              token.subscriptionStatus === "trialing")
          ? "/dashboard/home"
          : "/dashboard/subscribe",
        req.url
      );
      url.searchParams.delete("callbackUrl"); // Always clear callbackUrl
      return NextResponse.redirect(url);
    }

    // Log for debugging
    console.log("Middleware:", {
      pathname,
      isAuthenticated: !!token,
      role: token?.role,
      status: token?.status,
      subscriptionStatus: token?.subscriptionStatus,
    });

    // Redirect unauthenticated users
    if (!token) {
      if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/admin/dashboard")
      ) {
        const redirectUrl = new URL("/", req.url);
        redirectUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.next();
    }

    // Allow admins to access all /admin routes without subscription checks
    if (token.role === "admin" && pathname.startsWith("/admin")) {
      return NextResponse.next();
    }

    // Redirect suspended users to /dashboard/subscribe
    if (token.role === "agent" && token.status === "suspended") {
      const redirectUrl = new URL("/dashboard/subscribe", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Handle public pages and /dashboard/subscribe
    if (
      pathname === "/" ||
      pathname === "/admin" ||
      pathname === "/subscribe" ||
      pathname === "/dashboard/subscribe"
    ) {
      if (token) {
        const redirectPath =
          token.role === "admin"
            ? "/admin/dashboard"
            : token.subscriptionStatus === "active" ||
              token.subscriptionStatus === "trialing"
            ? "/dashboard/home"
            : "/dashboard/subscribe";
        if (pathname !== redirectPath) {
          return NextResponse.redirect(new URL(redirectPath, req.url));
        }
      }
      return NextResponse.next();
    }

    // Check subscription status for other /dashboard routes
    if (
      token.role === "agent" &&
      token.subscriptionStatus !== "active" &&
      token.subscriptionStatus !== "trialing" &&
      pathname.startsWith("/dashboard")
    ) {
      const redirectUrl = new URL("/dashboard/subscribe", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        // Allow public pages and /dashboard/subscribe
        if (
          pathname === "/" ||
          pathname === "/admin" ||
          pathname === "/subscribe" ||
          pathname === "/dashboard/subscribe"
        ) {
          return true;
        }

        // Allow admins to access all /admin routes
        if (token?.role === "admin" && pathname.startsWith("/admin")) {
          return true;
        }

        // Protect dashboard routes for agents
        if (pathname.startsWith("/dashboard")) {
          return (
            !!token &&
            token.role === "agent" &&
            token.status === "active" &&
            (pathname === "/dashboard/subscribe" ||
              token.subscriptionStatus === "active" ||
              token.subscriptionStatus === "trialing")
          );
        }

        // Protect admin dashboard routes
        if (pathname.startsWith("/admin/dashboard")) {
          return !!token && token.role === "admin" && token.status === "active";
        }

        return false;
      },
    },
    pages: { signIn: "/" },
  }
);

export const config = {
  matcher: ["/", "/admin/:path*", "/dashboard/:path*", "/subscribe"],
};
