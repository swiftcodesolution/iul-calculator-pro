import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import prisma from "./connect";
import { randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          const userAgent = req.headers?.["user-agent"] || "Unknown";
          const deviceInfo = { userAgent, loginTime: new Date().toISOString() };
          console.log("Login Attempt Device Info:", deviceInfo);

          if (user && credentials.password === user.password) {
            const activeSession = await prisma.session.findFirst({
              where: { userId: user.id, expires: { gt: new Date() } },
            });

            if (activeSession) {
              throw new Error(
                "User is already logged in on another device. Please log out first."
              );
            }

            const sessionToken = randomUUID();
            const lol = await prisma.session.create({
              data: {
                userId: user.id,
                sessionToken,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                // deviceInfo: JSON.stringify(deviceInfo),
              },
            });

            console.log(lol);

            return { ...user, sessionToken };
          }
          return null;
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sessionToken = user.sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.sessionToken = token.sessionToken as string;
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
