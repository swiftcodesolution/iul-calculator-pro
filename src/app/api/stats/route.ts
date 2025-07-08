// src/app/api/stats/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
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
            expires: { gt: new Date() },
          },
        },
      },
    });

    // Total files uploaded
    const totalFiles = await prisma.clientFile.count();

    // Active subscriptions (non-expired trials or active paid subscriptions)
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        OR: [
          { status: "active" },
          {
            planType: "trial",
            renewalDate: { gte: new Date() },
          },
        ],
      },
    });

    // Trial users
    const trialUsers = await prisma.subscription.count({
      where: { planType: "trial" },
    });

    // Files per category
    const filesByCategory = await prisma.clientFile.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
    });

    // Files per user
    const filesByUser = await prisma.clientFile.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Map user IDs to user info (email, firstName, lastName)
    // const userIds = filesByUser.map((entry) => entry.userId);
    const userIds = filesByUser
      .map((entry) => entry.userId)
      .filter((id): id is string => id !== null);

    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    const filesPerUser = filesByUser.map((entry) => {
      const user = users.find((u) => u.id === entry.userId);
      return {
        userId: entry.userId,
        userEmail: user?.email || "Unknown",
        userName: user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
          : "Unknown",
        fileCount: entry._count.id,
      };
    });

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
      activeSubscriptions,
      trialUsers,
      filesByCategory: filesByCategory.map((entry) => ({
        category: entry.category,
        count: entry._count.id,
      })),
      filesPerUser,
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
        userEmail: file.user?.email,
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
