// src/app/api/insurance-company-requests/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createTransporter } from "@/lib/nodemailer";

// POST: Submit a new insurance company request and send email
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const transporter = await createTransporter();
  const { name, website } = await request.json();

  if (!name) {
    return NextResponse.json(
      { error: "Missing required field: name" },
      { status: 400 }
    );
  }

  try {
    // Save request to database and include submitter's email
    const companyRequest = await prisma.insuranceCompanyRequest.create({
      data: {
        name,
        website,
        submittedBy: session.user.id,
      },
      include: {
        submittedByUser: {
          select: { email: true },
        },
      },
    });

    // Send email to admin
    await transporter.sendMail({
      from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Insurance Company Request",
      text: `
        A new insurance company request has been submitted.
        
        Company Name: ${name}
        Website: ${website || "Not provided"}
        Submitted By: ${companyRequest.submittedByUser.email}
        Submitted At: ${new Date().toLocaleString()}
      `,
      html: `
        <h2>New Insurance Company Request</h2>
        <p><strong>Company Name:</strong> ${name}</p>
        <p><strong>Website:</strong> ${website || "Not provided"}</p>
        <p><strong>Submitted By:</strong> ${
          companyRequest.submittedByUser.email
        }</p>
        <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    return NextResponse.json(companyRequest, { status: 201 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
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
