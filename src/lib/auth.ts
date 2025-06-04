import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import prisma from "./connect";

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
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          !credentials?.deviceFingerprint
        )
          return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (user && credentials.password === user.password) {
            if (
              user.deviceFingerprint &&
              user.deviceFingerprint !== credentials.deviceFingerprint
            ) {
              throw new Error(
                "Login restricted to the device used for signup."
              );
            }

            return {
              ...user,
              deviceFingerprint: credentials.deviceFingerprint,
            };
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
