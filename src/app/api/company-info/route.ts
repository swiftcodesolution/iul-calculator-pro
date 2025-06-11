import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { put, del } from "@vercel/blob";

// GET: Fetch CompanyInfo for authenticated user
export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { companyInfo: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.companyInfo || null);
  } catch (error) {
    console.error("GET /api/company-info error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Create or update CompanyInfo
export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const businessName = formData.get("businessName") as string;
    const agentName = formData.get("agentName") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const logoFile = formData.get("companyLogo") as File | null;
    const profilePicFile = formData.get("agentProfilePic") as File | null;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { companyInfo: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let companyLogo: string | undefined;
    let agentProfilePic: string | undefined;

    // Upload images to Vercel Blob if provided
    if (logoFile) {
      const { url } = await put(`logos/${user.id}_${logoFile.name}`, logoFile, {
        access: "public",
      });
      companyLogo = url;
    }

    if (profilePicFile) {
      const { url } = await put(
        `profile-pics/${user.id}_${profilePicFile.name}`,
        profilePicFile,
        {
          access: "public",
        }
      );
      agentProfilePic = url;
    }

    // Upsert CompanyInfo
    const companyInfo = await prisma.companyInfo.upsert({
      where: { id: user.companyInfoId || "non-existent-id" },
      update: {
        businessName,
        agentName,
        email,
        phoneNumber,
        ...(companyLogo && { companyLogo }),
        ...(agentProfilePic && { agentProfilePic }),
      },
      create: {
        businessName,
        agentName,
        email,
        phoneNumber,
        companyLogo,
        agentProfilePic,
        user: { connect: { id: user.id } },
      },
    });

    // Update user's companyInfoId
    await prisma.user.update({
      where: { id: user.id },
      data: { companyInfoId: companyInfo.id },
    });

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error("POST /api/company-info error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE: Remove image from CompanyInfo
export async function DELETE(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as
      | "companyLogo"
      | "agentProfilePic"
      | null;

    if (!type) {
      return NextResponse.json({ error: "Type required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { companyInfo: true },
    });

    if (!user || !user.companyInfo) {
      return NextResponse.json(
        { error: "CompanyInfo not found" },
        { status: 404 }
      );
    }

    // Delete image from Vercel Blob
    if (user.companyInfo[type]) {
      await del(user.companyInfo[type]);
    }

    // Update CompanyInfo
    const updatedCompanyInfo = await prisma.companyInfo.update({
      where: { id: user.companyInfo.id },
      data: { [type]: null },
    });

    return NextResponse.json(updatedCompanyInfo);
  } catch (error) {
    console.error("DELETE /api/company-info error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
