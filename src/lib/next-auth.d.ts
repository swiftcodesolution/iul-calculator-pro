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
      deviceFingerprint?: string;
      role: string;
    };
  }
  interface User {
    deviceFingerprint?: string;
    role: string;
  }
}

declare module "@prisma/client" {
  interface Session {
    deviceInfo?: string;
    role: string;
  }
  interface User {
    deviceFingerprint?: string;
    role: string;
  }
}
