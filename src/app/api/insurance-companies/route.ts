// src/app/api/insurance-companies/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { name, website } = await request.json();

  if (!name) {
    return NextResponse.json(
      { error: "Missing required field: name" },
      { status: 400 }
    );
  }

  try {
    const company = await prisma.insuranceCompany.create({
      data: {
        name,
        website,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Error creating insurance company:", error);
    return NextResponse.json(
      { error: "Failed to create insurance company" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const companies = await prisma.insuranceCompany.findMany({
      include: {
        createdByUser: { select: { email: true } },
      },
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error fetching insurance companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance companies" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, name, website } = await request.json();

  const company = await prisma.insuranceCompany.findUnique({
    where: { id },
  });
  if (!company) {
    return NextResponse.json(
      { error: "Insurance company not found" },
      { status: 404 }
    );
  }

  try {
    const updatedCompany = await prisma.insuranceCompany.update({
      where: { id },
      data: {
        name,
        website,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error updating insurance company:", error);
    return NextResponse.json(
      { error: "Failed to update insurance company" },
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

  const company = await prisma.insuranceCompany.findUnique({
    where: { id },
  });
  if (!company) {
    return NextResponse.json(
      { error: "Insurance company not found" },
      { status: 404 }
    );
  }

  try {
    await prisma.insuranceCompany.delete({ where: { id } });
    return NextResponse.json({ message: "Insurance company deleted" });
  } catch (error) {
    console.error("Error deleting insurance company:", error);
    return NextResponse.json(
      { error: "Failed to delete insurance company" },
      { status: 500 }
    );
  }
}
