import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        cellPhone: true,
        officePhone: true,
        role: true,
        status: true,
        sessionHistory: {
          select: {
            id: true,
            sessionToken: true,
            ipAddress: true,
            userAgent: true,
            browserName: true,
            browserVersion: true,
            osName: true,
            osVersion: true,
            deviceType: true,
            deviceVendor: true,
            deviceModel: true,
            loginAt: true,
            logoutAt: true,
          },
        },
        _count: {
          select: { files: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const companyInfo = await prisma.companyInfo.findFirst({
      where: { userId }, // Changed from email to userId
      select: {
        id: true,
        businessName: true,
        agentName: true,
        email: true,
        phone: true,
        logoSrc: true,
        profilePicSrc: true,
      },
    });

    const filesByCategory = await prisma.clientFile.groupBy({
      where: { userId },
      by: ["category"],
      _count: { id: true },
    });

    const recentFiles = await prisma.clientFile.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        category: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ...user,
      companyInfo: companyInfo
        ? {
            id: companyInfo.id,
            businessName: companyInfo.businessName,
            agentName: companyInfo.agentName,
            email: companyInfo.email,
            phoneNumber: companyInfo.phone, // Map phone to phoneNumber for consistency
            companyLogo: companyInfo.logoSrc, // Map logoSrc to companyLogo
            agentProfilePic: companyInfo.profilePicSrc, // Map profilePicSrc to agentProfilePic
          }
        : null,
      filesByCategory: filesByCategory.map((entry) => ({
        category: entry.category,
        count: entry._count.id,
      })),
      recentFiles: recentFiles.map((file) => ({
        id: file.id,
        fileName: file.fileName,
        category: file.category,
        createdAt: file.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.clientFile.deleteMany({ where: { userId } });
    await prisma.companyInfo.deleteMany({ where: { userId } }); // Changed from email to userId
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const { status } = await request.json();

  if (!["active", "suspended"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        cellPhone: true,
        officePhone: true,
        role: true,
        status: true,
        sessionHistory: {
          select: {
            id: true,
            sessionToken: true,
            ipAddress: true,
            userAgent: true,
            browserName: true,
            browserVersion: true,
            osName: true,
            osVersion: true,
            deviceType: true,
            deviceVendor: true,
            deviceModel: true,
            loginAt: true,
            logoutAt: true,
          },
        },
        _count: {
          select: { files: true },
        },
      },
    });

    const companyInfo = await prisma.companyInfo.findFirst({
      where: { userId }, // Changed from email to userId
      select: {
        id: true,
        businessName: true,
        agentName: true,
        email: true,
        phone: true,
        logoSrc: true,
        profilePicSrc: true,
      },
    });

    return NextResponse.json({
      ...user,
      companyInfo: companyInfo
        ? {
            id: companyInfo.id,
            businessName: companyInfo.businessName,
            agentName: companyInfo.agentName,
            email: companyInfo.email,
            phoneNumber: companyInfo.phone, // Map phone to phoneNumber
            companyLogo: companyInfo.logoSrc, // Map logoSrc to companyLogo
            agentProfilePic: companyInfo.profilePicSrc, // Map profilePicSrc to agentProfilePic
          }
        : null,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
