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
  const file = formData.get("file") as File | null;
  const link = formData.get("link") as string | null;

  if (!tabName || (!file && !link)) {
    return NextResponse.json(
      { error: "Tab name and either file or link are required" },
      { status: 400 }
    );
  }

  try {
    let fileName: string | null = null;
    let filePath: string | null = null;
    let fileFormat: string | null = null;

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

    const tabContent = await prisma.tabContent.create({
      data: {
        user: {
          connect: { id: session.user.id },
        },
        tabName,
        fileName,
        filePath,
        fileFormat,
        link: link || null,
        createdByRole: session.user.role,
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
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If admin, fetch all tab content with user data
    if (session.user.role === "admin") {
      const tabContents = await prisma.tabContent.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              email: true,
            },
          },
        },
      });
      return NextResponse.json(tabContents);
    }

    // For non-admins, fetch only their own or admin-created content
    const tabContents = await prisma.tabContent.findMany({
      where: {
        OR: [{ userId: session.user.id }, { createdByRole: "admin" }],
      },
      include: {
        user: {
          select: {
            firstName: true,
            email: true,
          },
        },
      },
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
  const link = formData.get("link") as string | null;

  const tabContent = await prisma.tabContent.findUnique({
    where: { id },
  });
  if (
    !tabContent ||
    (tabContent.userId !== session.user.id && session.user.role !== "admin")
  ) {
    return NextResponse.json(
      { error: "Tab content not found or unauthorized" },
      { status: 400 }
    );
  }

  if (tabContent.createdByRole === "admin" && session.user.role !== "admin") {
    return NextResponse.json({
      message: "Cannot modify admin-created tab content",
      tabContent,
    });
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
      where: { id },
      data: {
        tabName,
        fileName,
        filePath,
        fileFormat,
        link: link || undefined,
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
    where: { id },
  });
  if (
    !tabContent ||
    (tabContent.userId !== session.user.id && session.user.role !== "admin")
  ) {
    return NextResponse.json(
      { error: "Tab content not found or unauthorized" },
      { status: 400 }
    );
  }

  try {
    await prisma.tabContent.delete({
      where: { id },
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
