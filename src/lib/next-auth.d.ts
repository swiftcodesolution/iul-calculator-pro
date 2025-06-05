import { JWT } from "next-auth/jwt";

// Extend NextRequest for next-auth token in middleware
declare module "next/server" {
  interface NextRequest {
    nextauth?: {
      token: JWT | null;
    };
  }
}

// Extend next-auth types for Session and User
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      deviceFingerprint?: string;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    deviceFingerprint?: string;
    role: string;
  }
}

// Extend @prisma/client types for User
declare module "@prisma/client" {
  interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    deviceFingerprint?: string;
    role: string;
  }
}
