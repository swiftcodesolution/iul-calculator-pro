// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (user && credentials.password === user.password) {
          return user;
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET, // or hardcoded if testing
  callbacks: {
    async redirect({
      url: redirectUrl,
      baseUrl,
    }: {
      url: string;
      baseUrl: string;
    }) {
      return redirectUrl.startsWith(baseUrl)
        ? redirectUrl
        : `${baseUrl}/dashboard/home`;
    },
  },
  pages: {
    signIn: "/",
    error: "/api/auth/error",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
