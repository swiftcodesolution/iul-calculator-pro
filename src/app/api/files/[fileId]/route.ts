/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return NextResponse.json(file);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await params;
  const { boxesData, tablesData, combinedResults, fields, category, fileName } =
    await request.json();

  const file = await prisma.clientFile.findUnique({ where: { id: fileId } });
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
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
        ...(fields && { fields }),
        ...(category && { category }),
        ...(fileName && { fileName }),
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
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  await prisma.clientFile.delete({ where: { id: fileId } });
  return NextResponse.json({ message: "File deleted" });
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
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (action === "clearTablesData") {
    try {
      const currentFile = await prisma.clientFile.findUnique({
        where: { id: fileId },
        select: { tablesData: true },
      });

      // Ensure tablesData is an object before spreading
      const updatedTablesData =
        currentFile?.tablesData && typeof currentFile.tablesData === "object"
          ? { ...currentFile.tablesData, tables: [] }
          : { tables: [] };

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

  if (action === "clearFieldsData") {
    try {
      const currentFile = await prisma.clientFile.findUnique({
        where: { id: fileId },
        select: { fields: true },
      });

      const updatedFieldsData = (currentFile?.fields as any) || {};
      if (Array.isArray(updatedFieldsData.fields)) {
        updatedFieldsData.fields = [];
      }

      const updatedFile = await prisma.clientFile.update({
        where: { id: fileId },
        data: {
          fields: {},
          tablesData: { tables: [] },
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Fields array cleared",
        file: updatedFile,
      });
    } catch (error) {
      console.error("Error clearing fields array:", error);
      return NextResponse.json(
        { error: "Failed to clear fields array" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
