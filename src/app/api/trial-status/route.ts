import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/connect";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const trialToken = await prisma.trialToken.findUnique({
      where: { userId: session.user.id },
    });

    if (!trialToken) {
      return NextResponse.json({ status: "none" });
    }

    const isExpired = trialToken.expiresAt < new Date();
    return NextResponse.json({ status: isExpired ? "expired" : "active" });
  } catch (error) {
    console.error("Error fetching trial status:", error);
    return NextResponse.json(
      { error: "Failed to fetch trial status" },
      { status: 500 }
    );
  }
}
