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

  if (file.createdByRole === "admin" && session.user.role !== "admin") {
    return NextResponse.json({
      message: "Changes not saved for Pro Sample Files",
      file,
    });
  }

  const validCategories = [
    "Pro Sample Files",
    "Your Sample Files",
    "Your Prospect Files",
    "Your Closed Sales",
  ];
  if (category && !validCategories.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  try {
    const updatedFile = await prisma.clientFile.update({
      where: { id: fileId },
      data: {
        ...(boxesData && { boxesData }),
        ...(tablesData && { tablesData }),
        ...(combinedResults && { combinedResults }),
        ...(category && { category }),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updatedFile);
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Failed to update file" },
      { status: 500 }
    );
  }
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await params;
  const { action } = await request.json();

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

  if (file.createdByRole === "admin" && session.user.role !== "admin") {
    return NextResponse.json({
      message: "Cannot modify Pro Sample Files",
      file,
    });
  }

  if (action === "clearTablesData") {
    try {
      // Step 1: Fetch current tablesData
      const currentFile = await prisma.clientFile.findUnique({
        where: { id: fileId },
        select: { tablesData: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedTablesData = (currentFile?.tablesData as any) || {};

      // Step 2: Clear only the 'tables' array if it exists and is an array
      if (Array.isArray(updatedTablesData.tables)) {
        updatedTablesData.tables = [];
      }

      // Step 3: Update the file with modified tablesData
      const updatedFile = await prisma.clientFile.update({
        where: { id: fileId },
        data: {
          tablesData: updatedTablesData,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Tables array cleared",
        file: updatedFile,
      });
    } catch (error) {
      console.error("Error clearing tables array:", error);
      return NextResponse.json(
        { error: "Failed to clear tables array" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
