// src/app/api/tab-content/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const tabName = formData.get("tabName") as string;
  const file = formData.get("file") as File;

  if (!tabName || !file) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const blob = await put(
      `tab-content/${session.user.id}/${Date.now()}-${file.name}`,
      file,
      { access: "public" }
    );

    const tabContent = await prisma.tabContent.create({
      data: {
        userId: session.user.id,
        tabName,
        fileName: file.name,
        filePath: blob.url,
        fileFormat: file.type,
      },
    });

    return NextResponse.json(tabContent, { status: 201 });
  } catch (error) {
    console.error("Error creating tab content:", error);
    return NextResponse.json(
      { error: "Failed to create tab content" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tabContents = await prisma.tabContent.findMany({
      where: { userId: session.user.id },
    });
    return NextResponse.json(tabContents);
  } catch (error) {
    console.error("Error fetching tab content:", error);
    return NextResponse.json(
      { error: "Failed to fetch tab content" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const id = formData.get("id") as string;
  const tabName = formData.get("tabName") as string;
  const file = formData.get("file") as File | null;

  const tabContent = await prisma.tabContent.findUnique({
    where: { id, userId: session.user.id },
  });
  if (!tabContent) {
    return NextResponse.json(
      { error: "Tab content not found" },
      { status: 400 }
    );
  }

  try {
    let fileName = tabContent.fileName;
    let filePath = tabContent.filePath;
    let fileFormat = tabContent.fileFormat;

    if (file) {
      const blob = await put(
        `tab-content/${session.user.id}/${Date.now()}-${file.name}`,
        file,
        { access: "public" }
      );
      fileName = file.name;
      filePath = blob.url;
      fileFormat = file.type;
    }

    const updatedTabContent = await prisma.tabContent.update({
      where: { id, userId: session.user.id },
      data: {
        tabName,
        fileName,
        filePath,
        fileFormat,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedTabContent);
  } catch (error) {
    console.error("Error updating tab content:", error);
    return NextResponse.json(
      { error: "Failed to update tab content" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  const tabContent = await prisma.tabContent.findUnique({
    where: { id, userId: session.user.id },
  });
  if (!tabContent) {
    return NextResponse.json(
      { error: "Tab content not found" },
      { status: 400 }
    );
  }

  try {
    await prisma.tabContent.delete({
      where: { id, userId: session.user.id },
    });
    return NextResponse.json({ message: "Tab content deleted" });
  } catch (error) {
    console.error("Error deleting tab content:", error);
    return NextResponse.json(
      { error: "Failed to delete tab content" },
      { status: 500 }
    );
  }
}
