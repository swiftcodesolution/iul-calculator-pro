import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/connect";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const contacts = await prisma.adminContact.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });
    return NextResponse.json(
      contacts.map((c) => ({
        id: c.id,
        userId: c.userId,
        userEmail: c.user.email,
        userName: `${c.user.firstName || ""} ${c.user.lastName || ""}`.trim(),
        message: c.message,
        createdAt: c.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching admin contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
