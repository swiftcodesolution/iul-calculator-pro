/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt"; // Import JWT from next-auth/jwt
import prisma from "./connect";
import { UAParser } from "ua-parser-js";
import { NextApiResponse } from "next";

const sanitizeIpAddress = (ip: string): string => {
  const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip) ? ip : "unknown";
};

// Define custom JWT interface
interface CustomJWT extends JWT {
  id?: string;
  role?: string;
  status?: string;
  jti?: string;
  subscriptionStatus?: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginPath: { label: "Login Path", type: "text" },
      },
      async authorize(credentials, req) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          !credentials.loginPath
        ) {
          console.log("Authorize: Missing credentials", credentials);
          throw new Error("Missing credentials");
        }

        try {
          const normalizedEmail = credentials.email.toLowerCase();
          const loginPath = credentials.loginPath;

          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!user) {
            console.log("Authorize: User not found", normalizedEmail);
            throw new Error("User not found");
          }

          if (credentials.password !== user.password) {
            console.log("Authorize: Invalid password", normalizedEmail);
            throw new Error("Invalid password");
          }

          if (loginPath === "/admin" && user.role !== "admin") {
            console.log("Authorize: Non-admin on admin path", normalizedEmail);
            throw new Error("Only admin accounts can log in here");
          }
          if (loginPath === "/" && user.role === "admin") {
            console.log("Authorize: Admin on non-admin path", normalizedEmail);
            throw new Error(
              "Admin accounts can only be logged in from admin login page"
            );
          }

          const headers = req.headers || {};
          const ipAddress = sanitizeIpAddress(
            (headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
              (headers["x-real-ip"] as string) ||
              "unknown"
          );
          const userAgent = (headers["user-agent"] as string) || "unknown";

          const parser = new UAParser(userAgent);
          const { browser, os, device } = parser.getResult();

          const sessionToken = crypto.randomUUID();
          const sessionExpires = new Date(Date.now() + 3600 * 1000);

          await prisma.session.create({
            data: {
              userId: user.id,
              sessionToken,
              expires: sessionExpires,
            },
          });

          console.log("Authorize: Session created", {
            sessionToken,
            userId: user.id,
          });

          await prisma.sessionHistory.create({
            data: {
              userId: user.id,
              sessionToken,
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

          const userReturn = {
            id: user.id,
            email: user.email,
            firstName: user.firstName ?? undefined,
            lastName: user.lastName ?? undefined,
            role: user.role,
            status: user.status,
          };
          console.log("Authorize: Returning User", userReturn);
          return userReturn;
        } catch (error: any) {
          console.log("Authorize: Error", error.message);
          throw new Error(
            error.message.includes("User not found")
              ? "User not found"
              : error.message.includes("Invalid password")
              ? "Invalid password"
              : "Authentication failed"
          );
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 3600 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.jti = crypto.randomUUID();
      }
      return token;
    },
    async session({ session, token }: { session: any; token: CustomJWT }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "";
        session.user.status = token.status ?? "";

        try {
          const subscription = await prisma.subscription.findFirst({
            where: { userId: token.id },
          });
          session.user.subscriptionStatus = subscription
            ? subscription.status
            : "none";
          token.subscriptionStatus = subscription
            ? subscription.status
            : "none";
        } catch {
          session.user.subscriptionStatus = "none";
          token.subscriptionStatus = "none";
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
    async signIn({
      user,
      response,
    }: {
      user: any;
      response?: NextApiResponse;
    }) {
      response?.setHeader(
        "Set-Cookie",
        `user-role=${user.role}; Path=/; HttpOnly`
      );
      return true;
    },
  },
  pages: {
    signIn: "/",
    error: "/api/auth/error",
  },
  events: {
    async signOut({ token }) {
      if (token?.jti) {
        await prisma.session.deleteMany({ where: { sessionToken: token.jti } });
        await prisma.sessionHistory.updateMany({
          where: { sessionToken: token.jti, logoutAt: null },
          data: { logoutAt: new Date() },
        });
      }
    },
  },
};

process.on("exit", async () => {
  await prisma.$disconnect();
});
