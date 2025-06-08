// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;
    const isAuthPage = pathname === "/";
    const isAuthenticated = !!req.nextauth?.token;

    // Log path and auth status for every request
    console.log(
      "Path:",
      pathname,
      "Authenticated:",
      isAuthenticated,
      "IsAuthPage:",
      isAuthPage
    );

    // Redirect logged-in users from auth page to dashboard
    if (isAuthenticated && isAuthPage) {
      console.log("Redirecting to /dashboard/home");
      return NextResponse.redirect(new URL("/dashboard/home", req.url));
    }

    // Redirect unauthenticated users from dashboard to auth page
    if (!isAuthenticated && pathname.startsWith("/dashboard")) {
      console.log("Redirecting to /");
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log("Authorized callback - Token exists:", !!token);
        return !!token;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
