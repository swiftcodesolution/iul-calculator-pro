// src/app/api/session-history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/connect";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessionHistory = await prisma.sessionHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { loginAt: "desc" },
    });

    return NextResponse.json(sessionHistory, { status: 200 });
  } catch (error) {
    console.error("Session history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session history" },
      { status: 500 }
    );
  }
}
