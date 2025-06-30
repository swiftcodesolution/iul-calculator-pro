import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
      sessionToken,

      cookies: req.cookies.getAll(),
    });

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

    // Allow unauthenticated access to login pages
    if (pathname === "/" || pathname === "/admin") {
      if (token) {
        // Redirect authenticated users based on role
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
      redirectUrl.searchParams.set("callbackUrl", pathname); // Preserve callbackUrl
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
          sessionToken,
          token: token || "no token",
        }); // Debug

        // Allow access to login pages
        if (pathname === "/" || pathname === "/admin") {
          return true;
        }

        // Protect dashboard routes
        if (pathname.startsWith("/dashboard")) {
          // return !!token; // Allow any authenticated user for testing
          return !!token && token?.role === "agent"; // Re-enable for strict role check
        }

        // Protect admin dashboard routes
        if (pathname.startsWith("/admin/dashboard")) {
          return !!token && token?.role === "admin";
        }

        return false; // Deny other protected routes
      },
    },
    pages: {
      signIn: "/", // Default sign-in page
    },
  }
);

export const config = {
  matcher: ["/", "/admin", "/dashboard/:path*", "/admin/:path*"],
};
