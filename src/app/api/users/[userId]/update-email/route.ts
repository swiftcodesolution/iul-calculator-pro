import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { createTransporter } from "@/lib/nodemailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId } = await params;
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email },
    });

    const transporter = await createTransporter();
    const subject = "Your Email Has Been Updated";

    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text: `Your email address has been updated by an admin. Your new email is ${email}. You can now use this email to log in.`,
      html: `
        <h2>Email Updated</h2>
        <p>Your email address has been updated by an admin.</p>
        <p><strong>New Email:</strong> ${email}</p>
        <p>You can now use this email to log in.</p>
      `,
    });

    await prisma.emailLog.create({
      data: {
        userId,
        emailType: "email_update",
        recipient: email,
        subject,
        status: "sent",
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error("Update email error:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    await prisma.emailLog.create({
      data: {
        userId,
        emailType: "email_update",
        recipient: email,
        subject: "Email Update Notification",
        status: "failed",
        errorMessage,
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { error: "Failed to update email" },
      { status: 500 }
    );
  }
}
