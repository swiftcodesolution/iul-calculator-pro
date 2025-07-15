import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is an admin
  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  try {
    const { fileIds } = await request.json();

    // Validate fileIds
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty fileIds array" },
        { status: 400 }
      );
    }

    // Verify that all fileIds belong to the admin and are in "Pro Sample Files"
    const files = await prisma.clientFile.findMany({
      where: {
        id: { in: fileIds },
        userId: session.user.id,
        category: "Pro Sample Files",
      },
    });

    if (files.length !== fileIds.length) {
      return NextResponse.json(
        { error: "Some file IDs are invalid or not owned by admin" },
        { status: 400 }
      );
    }

    // Update the order of files (assuming a sortOrder field exists in the schema)
    await prisma.$transaction(
      fileIds.map((fileId, index) =>
        prisma.clientFile.update({
          where: { id: fileId },
          data: { sortOrder: index + 1 }, // Assuming sortOrder is a field in the ClientFile model
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering files:", error);
    return NextResponse.json(
      { error: "Failed to reorder files" },
      { status: 500 }
    );
  }
}
