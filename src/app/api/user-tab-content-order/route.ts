// src/app/api/user-tab-content-order/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tabs } = await request.json();

  // Validate tabs array
  if (!Array.isArray(tabs) || tabs.length === 0) {
    return NextResponse.json(
      { error: "Invalid or empty tabs array" },
      { status: 400 }
    );
  }

  // Validate each tab.id as a MongoDB ObjectID
  const invalidIds = tabs.filter(
    (tab: { id: string; order: number }) => !ObjectId.isValid(tab.id)
  );
  if (invalidIds.length > 0) {
    console.error(
      "Invalid tabContentIds:",
      invalidIds.map((tab) => tab.id)
    );
    return NextResponse.json(
      {
        error: `Invalid tabContentId(s): ${invalidIds
          .map((tab) => tab.id)
          .join(", ")}`,
      },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(async (prisma) => {
      // Delete existing user-specific orders to avoid duplicates
      await prisma.userTabContentOrder.deleteMany({
        where: { userId: session.user.id },
      });

      // Create new user-specific orders
      await prisma.userTabContentOrder.createMany({
        data: tabs.map((tab: { id: string; order: number }) => ({
          userId: session.user.id,
          tabContentId: tab.id,
          order: tab.order,
        })),
      });
    });

    return NextResponse.json({
      message: "User tab order updated successfully",
    });
  } catch (error) {
    console.error("Error updating user tab order:", error);
    return NextResponse.json(
      { error: "Failed to update user tab order" },
      { status: 500 }
    );
  }
}
