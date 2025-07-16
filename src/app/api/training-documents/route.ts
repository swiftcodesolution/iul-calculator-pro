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
  const order = parseInt(formData.get("order") as string, 10);

  if (!file || !fileName) {
    return NextResponse.json(
      { error: "File and name are required" },
      { status: 400 }
    );
  }

  if (isNaN(order)) {
    return NextResponse.json({ error: "Invalid order value" }, { status: 400 });
  }

  try {
    const blob = await put(
      `training-documents/${Date.now()}-${file.name}`,
      file,
      { access: "public" }
    );

    const fileFormat = file.name.split(".").pop() || "";

    const resource = await prisma.trainingDocuments.create({
      data: {
        fileName,
        filePath: blob.url,
        fileFormat,
        uploadedBy: session.user.id,
        order,
      },
    });

    // Fetch the user to get firstName for the response
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true },
    });

    return NextResponse.json(
      {
        ...resource,
        uploadedBy: user?.firstName || "Unknown",
      },
      { status: 201 }
    );
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
    const resources = await prisma.trainingDocuments.findMany({
      orderBy: { order: "asc" },
      include: {
        uploadedByUser: { select: { firstName: true } },
      },
    });

    // Transform response to match Resource interface
    const transformedResources = resources.map((resource) => ({
      ...resource,
      uploadedBy: resource.uploadedByUser?.firstName || "Unknown",
      uploadedByUser: undefined, // Remove relation from response
    }));

    return NextResponse.json(transformedResources);
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

  const resource = await prisma.trainingDocuments.findUnique({
    where: { id },
    include: { uploadedByUser: { select: { firstName: true } } },
  });
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  let filePath = resource.filePath;
  let fileFormat = resource.fileFormat;

  try {
    if (file) {
      const blob = await put(
        `training-documents/${Date.now()}-${file.name}`,
        file,
        { access: "public" }
      );
      filePath = blob.url;
      fileFormat = file.name.split(".").pop() || "";
    }

    const updatedResource = await prisma.trainingDocuments.update({
      where: { id },
      data: {
        fileName,
        filePath,
        fileFormat,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      ...updatedResource,
      uploadedBy: resource.uploadedByUser?.firstName || "Unknown",
    });
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

  const resource = await prisma.trainingDocuments.findUnique({
    where: { id },
  });
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  try {
    await prisma.trainingDocuments.delete({ where: { id } });
    return NextResponse.json({ message: "Resource deleted" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { error: "Failed to delete resource" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { orderedIds } = await request.json();

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    await prisma.$transaction(
      orderedIds.map((id: string, index: number) =>
        prisma.trainingDocuments.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({ message: "Order updated" });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
