import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await params;
  const { boxesData, tablesData, combinedResults, category } =
    await request.json();

  const file = await prisma.clientFile.findUnique({ where: { id: fileId } });
  if (
    !file ||
    (file.userId !== session.user.id && session.user.role !== "admin")
  ) {
    return NextResponse.json(
      { error: "File not found or unauthorized" },
      { status: 400 }
    );
  }

  // For admin-created files, only allow admins to save data changes
  if (file.createdByRole === "admin" && session.user.role !== "admin") {
    return NextResponse.json({
      message: "Changes not saved for Pro Sample Files",
      file,
    });
  }

  // Validate category if provided
  const validCategories = [
    "Pro Sample Files",
    "Your Sample Files",
    "Your Prospect Files",
    "Your Closed Sales",
  ];
  if (category && !validCategories.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // Update DB for allowed fields
  const updatedFile = await prisma.clientFile.update({
    where: { id: fileId },
    data: {
      ...(boxesData?.length > 0 && { boxesData }),
      ...(tablesData?.length > 0 && { tablesData }),
      ...(combinedResults?.length > 0 && { combinedResults }),
      ...(category && { category }),
    },
  });

  return NextResponse.json(updatedFile);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await params;
  const file = await prisma.clientFile.findUnique({ where: { id: fileId } });
  if (
    !file ||
    (file.userId !== session.user.id && session.user.role !== "admin")
  ) {
    return NextResponse.json(
      { error: "File not found or unauthorized" },
      { status: 400 }
    );
  }

  await prisma.clientFile.delete({ where: { id: fileId } });
  return NextResponse.json({ message: "File deleted" });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await params;
  const file = await prisma.clientFile.findUnique({ where: { id: fileId } });
  if (
    !file ||
    (file.userId !== session.user.id && session.user.role !== "admin")
  ) {
    return NextResponse.json(
      { error: "File not found or unauthorized" },
      { status: 400 }
    );
  }

  return NextResponse.json(file);
}
