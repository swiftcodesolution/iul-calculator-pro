import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const isAuthPage = req.nextUrl.pathname === "/";
    const isAuthenticated = !!req.nextauth?.token;

    // Redirect logged-in users from the sign-in page to /dashboard/home
    if (isAuthenticated && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard/home", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
