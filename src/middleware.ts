// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    const isAuthPage = pathname === "/";
    const isAuthenticated = !!req.nextauth?.token;

    if (isAuthenticated && isAuthPage) {
      console.log("Redirecting to /dashboard/home");
      return NextResponse.redirect(new URL("/dashboard/home", req.url));
    }

    if (!isAuthenticated && pathname.startsWith("/dashboard")) {
      console.log("Redirecting to /");
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        if (pathname.startsWith("/dashboard")) {
          return !!token && token?.role === "agent";
        }
        return true;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*"],
};
