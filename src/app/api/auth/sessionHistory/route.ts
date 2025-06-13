// src/app/api/session-history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/connect";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  try {
    const sessionHistory = await prisma.sessionHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { loginAt: "desc" },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });

    const total = await prisma.sessionHistory.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json(
      { data: sessionHistory, total, page, pageSize },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session history error:", error);

    const message =
      error instanceof Error ? error.message : "Database query failed!";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
