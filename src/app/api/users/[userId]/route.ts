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
        sessionHistory: {
          select: {
            id: true,
            sessionToken: true,
            deviceFingerprint: true,
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
          select: {
            files: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const companyInfo = await prisma.companyInfo.findFirst({
      where: { email: user.email },
      select: {
        id: true,
        businessName: true,
        agentName: true,
        email: true,
        phoneNumber: true,
        companyLogo: true,
        agentProfilePic: true,
      },
    });

    return NextResponse.json({ ...user, companyInfo });
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

    // Clear deviceFingerprint in sessionHistory
    await prisma.user.updateMany({
      where: { id: userId },
      data: { deviceFingerprint: null },
    });

    return NextResponse.json({
      message: "Device fingerprint cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing device fingerprint:", error);
    return NextResponse.json(
      { error: "Failed to clear device fingerprint" },
      { status: 500 }
    );
  }
}
