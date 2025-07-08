import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/connect";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { message } = await request.json();
  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true, lastName: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.adminContact.create({
      data: {
        userId: session.user.id,
        message,
      },
    });

    await transporter.sendMail({
      from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL, // Steve’s email
      subject: "IUL Sale Confirmation Request",
      text: `
        IUL Sale Confirmation Request:
        Name: ${user.firstName || ""} ${user.lastName || ""}
        Email: ${user.email}
        User ID: ${session.user.id}
        Message: ${message}
        Submitted At: ${new Date().toLocaleString()}
      `,
      html: `
        <h2>IUL Sale Confirmation Request</h2>
        <p><strong>Name:</strong> ${user.firstName || ""} ${
        user.lastName || ""
      }</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>User ID:</strong> ${session.user.id}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    return NextResponse.json(
      { message: "Message sent to admin" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending admin message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
