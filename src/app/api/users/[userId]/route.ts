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
            // deviceFingerprint: true,
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
        phone: true,
        logoSrc: true,
        profilePicSrc: true,
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
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete related records with onDelete: Restrict
    // await prisma.downloadResources.deleteMany({
    //   where: { uploadedBy: userId },
    // });
    // await prisma.trainingVideos.deleteMany({ where: { uploadedBy: userId } });
    // await prisma.trainingDocuments.deleteMany({
    //   where: { uploadedBy: userId },
    // });
    // await prisma.insuranceCompany.deleteMany({ where: { createdBy: userId } });
    // await prisma.insuranceCompanyRequest.deleteMany({
    //   where: { submittedBy: userId },
    // });

    await prisma.clientFile.deleteMany({ where: { userId: userId } });

    // Delete related companyInfo (has onDelete: Cascade, but explicit for clarity)
    await prisma.companyInfo.deleteMany({ where: { email: user.email } });

    // Delete user (cascades to Session, SessionHistory, TabContent)
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
      where: { email: user.email },
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

    return NextResponse.json({ ...user, companyInfo });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
