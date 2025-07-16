import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const tokens = await prisma.trialToken.findMany({
      select: {
        id: true,
        token: true,
        expiresAt: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    return NextResponse.json(
      tokens.map((token) => ({
        id: token.id,
        token: token.token,
        expiresAt: token.expiresAt.toISOString(),
        userId: token.userId,
        createdAt: token.createdAt.toISOString(),
        userEmail: token.user.email,
        userName:
          `${token.user.firstName || ""} ${token.user.lastName || ""}`.trim() ||
          "Unknown",
      }))
    );
  } catch (error) {
    console.error("Error fetching trial tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch trial tokens" },
      { status: 500 }
    );
  }
}
