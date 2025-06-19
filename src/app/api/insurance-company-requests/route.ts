// src/app/api/insurance-company-requests/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST: Submit a new insurance company request
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
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
    const companyRequest = await prisma.insuranceCompanyRequest.create({
      data: {
        name,
        website,
        submittedBy: session.user.id,
      },
    });
    return NextResponse.json(companyRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating insurance company request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}

// GET: Fetch all insurance company requests (admin only)
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const requests = await prisma.insuranceCompanyRequest.findMany({
      include: { submittedByUser: { select: { email: true } } },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an insurance company request (admin only)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await request.json();

  const companyRequest = await prisma.insuranceCompanyRequest.findUnique({
    where: { id },
  });
  if (!companyRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  try {
    await prisma.insuranceCompanyRequest.delete({ where: { id } });
    return NextResponse.json({ message: "Request deleted" });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
