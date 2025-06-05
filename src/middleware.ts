// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const isAuthPage = req.nextUrl.pathname === "/";
    const isAuthenticated = !!req.nextauth?.token;

    if (isAuthenticated && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard/home", req.url));
    }

    if (!isAuthenticated && req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Require token for protected routes
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
