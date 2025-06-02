/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest } from "next/server";
import { Session as PrismaSession, User as PrismaUser } from "@prisma/client";

declare module "next/server" {
  interface NextRequest {
    nextauth?: {
      token: Record<string, unknown> | null;
    };
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      sessionToken?: string;
    };
  }
  interface User {
    sessionToken?: string;
  }
}

declare module "@prisma/client" {
  interface Session {
    deviceInfo?: string;
  }
}
