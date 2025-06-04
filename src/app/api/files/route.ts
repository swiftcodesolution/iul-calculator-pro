// src/app/api/files/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileName } = await request.json();

  if (!fileName) {
    return NextResponse.json({ error: "File name required" }, { status: 400 });
  }

  const category =
    session.user.role === "admin" ? "Pro Sample Files" : "Your Prospect Files";

  const file = await prisma.clientFile.create({
    data: {
      userId: session.user.id,
      deviceFingerprint: session.user.deviceFingerprint || null,
      fileName,
      createdByRole: session.user.role,
      category,
      boxesData: null,
      tablesData: [],
      combinedResults: [],
    },
  });

  return NextResponse.json(file);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const files = await prisma.clientFile.findMany({
      where: {
        OR: [
          { userId: session.user.id }, // User's own files
          { createdByRole: "admin" }, // Admin-created files (Pro Sample Files)
        ],
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
