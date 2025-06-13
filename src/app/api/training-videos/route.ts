// src/app/api/training-videos/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const fileName = formData.get("fileName") as string;
  const link = formData.get("link") as string | null;

  if (!file && (!link || link.trim() === "")) {
    return NextResponse.json(
      { error: "Either a file or a link is required" },
      { status: 400 }
    );
  }

  try {
    let filePath: string | null = null;
    let fileFormat: string | null = null;

    if (file) {
      const blob = await put(
        `training-videos/${Date.now()}-${file.name}`,
        file,
        {
          access: "public",
        }
      );
      filePath = blob.url;
      fileFormat = file.name.split(".").pop() || null;
    }

    const resource = await prisma.trainingVideos.create({
      data: {
        fileName,
        filePath,
        fileFormat,
        link,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { error: "Failed to create resource" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const resources = await prisma.trainingVideos.findMany({
      include: {
        uploadedByUser: { select: { email: true } },
      },
    });
    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const id = formData.get("id") as string;
  const fileName = formData.get("fileName") as string;
  const file = formData.get("file") as File | null;
  const link = formData.get("link") as string | null;

  const resource = await prisma.trainingVideos.findUnique({ where: { id } });
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  let filePath = resource.filePath;
  let fileFormat = resource.fileFormat;

  try {
    if (file) {
      const blob = await put(
        `training-videos/${Date.now()}-${file.name}`,
        file,
        {
          access: "public",
        }
      );
      filePath = blob.url;
      fileFormat = file.name.split(".").pop() || null;
    }

    if (!file && (!link || link.trim() === "") && !filePath && !resource.link) {
      return NextResponse.json(
        { error: "At least a file or a link must be provided" },
        { status: 400 }
      );
    }

    const updatedResource = await prisma.trainingVideos.update({
      where: { id },
      data: {
        fileName,
        filePath,
        fileFormat,
        link,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("Error updating resource:", error);
    return NextResponse.json(
      { error: "Failed to update resource" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await request.json();

  const resource = await prisma.trainingVideos.findUnique({
    where: { id },
  });
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  try {
    await prisma.trainingVideos.delete({ where: { id } });
    return NextResponse.json({ message: "Resource deleted" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}
