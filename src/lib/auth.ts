import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
// import bcrypt from "bcrypt";
import prisma from "./connect";
import { UAParser } from "ua-parser-js";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        deviceFingerprint: { label: "Device Fingerprint", type: "text" },
      },
      async authorize(credentials, req) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          !credentials?.deviceFingerprint
        ) {
          throw new Error("Missing credentials");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("User not found");
          }

          if (credentials.password !== user.password) {
            throw new Error("Invalid password");
          }

          if (
            user.deviceFingerprint &&
            user.deviceFingerprint !== credentials.deviceFingerprint
          ) {
            throw new Error("Login restricted to the device used for signup.");
          }

          // Extract IP address and user-agent safely
          const headers = req.headers || {};
          const ipAddress =
            (headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
            (headers["x-real-ip"] as string) ||
            "unknown";
          const userAgent = (headers["user-agent"] as string) || "unknown";

          // Parse user-agent with ua-parser-js
          const parser = new UAParser(userAgent);
          const { browser, os, device } = parser.getResult();

          // Create session with unique sessionToken
          const sessionToken = crypto.randomUUID();
          await prisma.session.create({
            data: {
              userId: user.id,
              sessionToken,
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
          });

          // Create session history with same sessionToken
          await prisma.sessionHistory.create({
            data: {
              userId: user.id,
              sessionToken,
              deviceFingerprint: credentials.deviceFingerprint,
              ipAddress,
              userAgent,
              browserName: browser.name,
              browserVersion: browser.version,
              osName: os.name,
              osVersion: os.version,
              deviceType: device.type,
              deviceVendor: device.vendor,
              deviceModel: device.model,
              loginAt: new Date(),
              logoutAt: null,
            },
          });

          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName ?? undefined,
            lastName: user.lastName ?? undefined,
            role: user.role,
            deviceFingerprint: credentials.deviceFingerprint,
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed");
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 3600 },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.deviceFingerprint = user.deviceFingerprint;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.deviceFingerprint = token.deviceFingerprint as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : `${baseUrl}/dashboard/home`;
    },
  },

  pages: {
    signIn: "/",
    error: "/api/auth/error",
  },
};
