import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import crypto from "crypto";
import { createTransporter } from "@/lib/nodemailer";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { token, expiresAt },
      create: { userId: user.id, token, expiresAt },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}?email=${email}`;
    const subject = "Password Reset Request";

    const transporter = await createTransporter();

    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      text: `You requested a password reset. Click the link below to set a new password:\n\n${resetUrl}`,
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    await prisma.emailLog.create({
      data: {
        userId: user.id,
        emailType: "password_reset",
        recipient: email,
        subject,
        status: "sent",
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Reset email sent successfully" });
  } catch (error: unknown) {
    console.error("Reset email error:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.emailLog.create({
        data: {
          userId: user.id,
          emailType: "password_reset",
          recipient: email,
          subject: "Password Reset Request",
          status: "failed",
          errorMessage,
          sentAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
