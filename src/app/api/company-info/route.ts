import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingCompanyInfo = await prisma.companyInfo.findUnique({
    where: { userId: session.user.id },
  });
  if (existingCompanyInfo) {
    return NextResponse.json(
      { error: "Company info already exists" },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const businessName = formData.get("businessName") as string;
  const agentName = formData.get("agentName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const logoFile = formData.get("logoFile") as File | null;
  const profilePicFile = formData.get("profilePicFile") as File | null;

  if (!businessName || !agentName || !email || !phone) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  let logoSrc: string | null = null;
  let profilePicSrc: string | null = null;

  try {
    if (logoFile) {
      const blob = await put(
        `company-info/${session.user.id}/logo-${Date.now()}-${logoFile.name}`,
        logoFile,
        { access: "public" }
      );
      logoSrc = blob.url;
    }

    if (profilePicFile) {
      const blob = await put(
        `company-info/${session.user.id}/profile-${Date.now()}-${
          profilePicFile.name
        }`,
        profilePicFile,
        { access: "public" }
      );
      profilePicSrc = blob.url;
    }

    const companyInfo = await prisma.companyInfo.create({
      data: {
        businessName,
        agentName,
        email,
        phone,
        logoSrc,
        profilePicSrc,
        userId: session.user.id,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { companyInfoId: companyInfo.id },
    });

    return NextResponse.json(companyInfo, { status: 201 });
  } catch (error) {
    console.error("Error creating company info:", error);
    return NextResponse.json(
      { error: "Failed to create company info" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const companyInfo = await prisma.companyInfo.findUnique({
      where: { userId: session.user.id },
    });
    return NextResponse.json(companyInfo || {});
  } catch (error) {
    console.error("Error fetching company info:", error);
    return NextResponse.json(
      { error: "Failed to fetch company info" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const businessName = formData.get("businessName") as string;
  const agentName = formData.get("agentName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const logoFile = formData.get("logoFile") as File | null;
  const profilePicFile = formData.get("profilePicFile") as File | null;
  const logoSrcForm = formData.get("logoSrc") as string;
  const profilePicSrcForm = formData.get("profilePicSrc") as string;

  const companyInfo = await prisma.companyInfo.findUnique({
    where: { userId: session.user.id },
  });
  if (!companyInfo) {
    return NextResponse.json(
      { error: "Company info not found" },
      { status: 400 }
    );
  }

  let logoSrc = companyInfo.logoSrc;
  let profilePicSrc = companyInfo.profilePicSrc;

  try {
    if (logoFile) {
      const blob = await put(
        `company-info/${session.user.id}/logo-${Date.now()}-${logoFile.name}`,
        logoFile,
        { access: "public" }
      );
      logoSrc = blob.url;
    } else if (logoSrcForm === "") {
      logoSrc = null;
    }

    if (profilePicFile) {
      const blob = await put(
        `company-info/${session.user.id}/profile-${Date.now()}-${
          profilePicFile.name
        }`,
        profilePicFile,
        { access: "public" }
      );
      profilePicSrc = blob.url;
    } else if (profilePicSrcForm === "") {
      profilePicSrc = null;
    }

    const updatedCompanyInfo = await prisma.companyInfo.update({
      where: { userId: session.user.id },
      data: {
        businessName,
        agentName,
        email,
        phone,
        logoSrc,
        profilePicSrc,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCompanyInfo);
  } catch (error) {
    console.error("Error updating company info:", error);
    return NextResponse.json(
      { error: "Failed to update company info" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyInfo = await prisma.companyInfo.findUnique({
    where: { userId: session.user.id },
  });
  if (!companyInfo) {
    return NextResponse.json(
      { error: "Company info not found" },
      { status: 400 }
    );
  }

  try {
    await prisma.companyInfo.delete({ where: { userId: session.user.id } });
    await prisma.user.update({
      where: { id: session.user.id },
      data: { companyInfoId: null },
    });
    return NextResponse.json({ message: "Company info deleted" });
  } catch (error) {
    console.error("Error deleting company info:", error);
    return NextResponse.json(
      { error: "Failed to delete company info" },
      { status: 500 }
    );
  }
}
