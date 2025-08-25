// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth?.token;
    const sessionToken = req.cookies.get("next-auth.session-token")?.value;
    const userRole = token?.role || "user";

    // Log for debugging
    console.log("Middleware:", {
      pathname,
      isAuthenticated: !!token,
      role: token?.role,
      status: token?.status,
      subscriptionStatus: token?.subscriptionStatus,
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

    // Check subscription status from token
    if (
      token &&
      (token.status === "suspended" || token.subscriptionStatus !== "active")
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
            token.subscriptionStatus === "active"
          );
        }

        // Protect admin dashboard routes
        if (pathname.startsWith("/admin/dashboard")) {
          return (
            !!token &&
            token.role === "admin" &&
            token.status === "active" &&
            token.subscriptionStatus === "active"
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
