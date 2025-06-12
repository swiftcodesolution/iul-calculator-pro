// src/app/api/download-resources/route.ts
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
  const file = formData.get("file") as File;
  const fileName = formData.get("fileName") as string;

  if (!file || !fileName) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const blob = await put(
      `download-resources/${Date.now()}-${file.name}`,
      file,
      {
        access: "public",
      }
    );

    const resource = await prisma.downloadResources.create({
      data: {
        fileName,
        filePath: blob.url,
        fileFormat: file.name.split(".")[1],
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
    const resources = await prisma.downloadResources.findMany({
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

  const resource = await prisma.downloadResources.findUnique({
    where: { id },
  });
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  let filePath = resource.filePath;
  let fileFormat = resource.fileFormat;

  try {
    if (file) {
      const blob = await put(
        `download-resources/${Date.now()}-${file.name}`,
        file,
        {
          access: "public",
        }
      );
      filePath = blob.url;
      fileFormat = file.name.split(".")[1];
    }

    const updatedResource = await prisma.downloadResources.update({
      where: { id },
      data: {
        fileName,
        filePath,
        fileFormat,
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

  const resource = await prisma.downloadResources.findUnique({
    where: { id },
  });
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  try {
    await prisma.downloadResources.delete({ where: { id } });
    return NextResponse.json({ message: "Resource deleted" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}
