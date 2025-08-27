import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth?.token;

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

    // Prevent redirect loops and handle callbackUrl
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) {
      const url = new URL(
        token.role === "admin" ? "/admin/dashboard" : "/dashboard/home",
        req.url
      );
      url.searchParams.delete("callbackUrl");
      return NextResponse.redirect(url);
    }

    // Log for debugging
    console.log("Middleware:", {
      pathname,
      isAuthenticated: !!token,
      role: token?.role,
    });

    // Restrict admins from accessing /dashboard/*
    if (token.role === "admin" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Allow admins to access /admin/* routes
    if (token.role === "admin" && pathname.startsWith("/admin")) {
      return NextResponse.next();
    }

    // Handle public pages
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

    // Allow authenticated agents to access /dashboard/*
    if (token.role === "agent" && pathname.startsWith("/dashboard")) {
      return NextResponse.next();
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

        // Require authentication for dashboard routes
        if (!token) {
          return false;
        }

        // Allow admins to access /admin/* routes
        if (token.role === "admin" && pathname.startsWith("/admin")) {
          return true;
        }

        // Restrict admins from /dashboard/*
        if (token.role === "admin" && pathname.startsWith("/dashboard")) {
          return false;
        }

        // Allow agents to access /dashboard/*
        if (pathname.startsWith("/dashboard")) {
          return token.role === "agent";
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
