/* eslint-disable @typescript-eslint/no-empty-object-type */
import { JWT } from "next-auth/jwt";

// Extend NextRequest for next-auth token in middleware
declare module "next/server" {
  interface NextRequest {
    nextauth?: {
      token: JWT | null;
    };
  }
}

// Shared User interface
interface CustomUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  deviceFingerprint?: string | null;
  role: string;
  status: string;
}

// Extend next-auth types for Session and User
declare module "next-auth" {
  // interface Session {
  //   user: {
  //     id: string;
  //     email: string;
  //     deviceFingerprint?: string;
  //     role: string;
  //   };
  // }

  // interface User {
  //   id: string;
  //   email: string;
  //   firstName?: string;
  //   lastName?: string;
  //   deviceFingerprint?: string;
  //   role: string;
  // }

  interface Session {
    user: CustomUser;
  }

  interface User extends CustomUser {}

  interface CallbacksOptions {
    redirect({
      url,
      baseUrl,
      token,
    }: {
      url: string;
      baseUrl: string;
      token?: JWT;
    }): Promise<string>;
  }
}

// Extend @prisma/client types for User
declare module "@prisma/client" {
  // interface User {
  //   id: string;
  //   email: string;
  //   firstName?: string;
  //   lastName?: string;
  //   deviceFingerprint?: string;
  //   role: string;
  // }

  interface User extends CustomUser {}
}
