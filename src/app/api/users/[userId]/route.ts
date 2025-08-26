// users/[userId]/route.ts
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
        foreverFree: true,
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
        TrialToken: {
          select: {
            token: true,
            createdAt: true,
            expiresAt: true,
          },
        },
        AdminContact: {
          select: {
            id: true,
            message: true,
            createdAt: true,
          },
        },
        Subscription: {
          select: {
            id: true,
            planType: true,
            status: true,
            startDate: true,
            renewalDate: true,
            iulSales: {
              select: {
                id: true,
                saleDate: true,
                verified: true,
                verifiedAt: true,
              },
            },
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
      where: { userId },
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
            phoneNumber: companyInfo.phone,
            companyLogo: companyInfo.logoSrc,
            agentProfilePic: companyInfo.profilePicSrc,
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
      subscription:
        user.Subscription.length > 0
          ? {
              id: user.Subscription[0].id,
              planType: user.Subscription[0].planType,
              status: user.Subscription[0].status,
              startDate: user.Subscription[0].startDate.toISOString(),
              endDate: user.Subscription[0].renewalDate?.toISOString() || null,
              iulSales: user.Subscription[0].iulSales.map((sale) => ({
                id: sale.id,
                saleDate: sale.saleDate.toISOString(),
                verified: sale.verified,
                verifiedAt: sale.verifiedAt?.toISOString() || null,
              })),
            }
          : null,
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
    await prisma.companyInfo.deleteMany({ where: { userId } });
    await prisma.trialToken.deleteMany({ where: { userId } });
    await prisma.adminContact.deleteMany({ where: { userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId } = await params;
  const { status, foreverFree } = await request.json();

  if (!["active", "suspended"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (foreverFree !== undefined && typeof foreverFree !== "boolean") {
    return NextResponse.json(
      { error: "Invalid foreverFree value" },
      { status: 400 }
    );
  }

  try {
    // Determine subscription status based on user status and foreverFree
    const subscriptionStatus =
      foreverFree === true
        ? "active"
        : status === "active"
        ? "active"
        : "expired";

    // Update user and subscription in a transaction
    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          status,
          ...(foreverFree !== undefined && { foreverFree }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          cellPhone: true,
          officePhone: true,
          role: true,
          status: true,
          foreverFree: true,
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
          TrialToken: {
            select: {
              token: true,
              createdAt: true,
              expiresAt: true,
            },
          },
          AdminContact: {
            select: {
              id: true,
              message: true,
              createdAt: true,
            },
          },
          Subscription: {
            select: {
              id: true,
              planType: true,
              status: true,
              startDate: true,
              renewalDate: true,
              iulSales: {
                select: {
                  id: true,
                  saleDate: true,
                  verified: true,
                  verifiedAt: true,
                },
              },
            },
          },
          _count: {
            select: { files: true },
          },
        },
      }),
      prisma.subscription.updateMany({
        where: { userId },
        data: { status: subscriptionStatus, updatedAt: new Date() },
      }),
    ]);

    const companyInfo = await prisma.companyInfo.findFirst({
      where: { userId },
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
            phoneNumber: companyInfo.phone,
            companyLogo: companyInfo.logoSrc,
            agentProfilePic: companyInfo.profilePicSrc,
          }
        : null,
      subscription:
        user.Subscription.length > 0
          ? {
              id: user.Subscription[0].id,
              planType: user.Subscription[0].planType,
              status: user.Subscription[0].status,
              startDate: user.Subscription[0].startDate.toISOString(),
              endDate: user.Subscription[0].renewalDate?.toISOString() || null,
              iulSales: user.Subscription[0].iulSales.map((sale) => ({
                id: sale.id,
                saleDate: sale.saleDate.toISOString(),
                verified: sale.verified,
                verifiedAt: sale.verifiedAt?.toISOString() || null,
              })),
            }
          : null,
    });
  } catch (error) {
    console.error("Error updating user and subscription status:", error);
    return NextResponse.json(
      { error: "Failed to update user or subscription status" },
      { status: 500 }
    );
  }
}
