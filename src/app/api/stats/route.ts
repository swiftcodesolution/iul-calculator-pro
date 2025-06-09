import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Active users (users with at least one session)
    const activeUsers = await prisma.user.count({
      where: {
        sessions: {
          some: {
            expires: { gt: new Date() }, // Active sessions (not expired)
          },
        },
      },
    });

    // Total files uploaded
    const totalFiles = await prisma.clientFile.count();

    // Recent sessions (last 3, ordered by loginAt)
    const recentSessions = await prisma.sessionHistory.findMany({
      take: 3,
      orderBy: { loginAt: "desc" },
      select: {
        id: true,
        user: { select: { email: true } },
        loginAt: true,
        osName: true,
        browserName: true,
      },
    });

    // Recent file uploads (last 3, ordered by createdAt)
    const recentFiles = await prisma.clientFile.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        user: { select: { email: true } },
        category: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      activeUsers,
      totalFiles,
      recentSessions: recentSessions.map((session) => ({
        id: session.id,
        userEmail: session.user.email,
        loginAt: session.loginAt.toISOString(),
        osName: session.osName,
        browserName: session.browserName,
      })),
      recentFiles: recentFiles.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        userEmail: file.user.email,
        category: file.category,
        createdAt: file.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
