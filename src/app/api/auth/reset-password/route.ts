import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hash } from "bcrypt";
import nodemailer from "nodemailer";

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Allow unauthenticated access for password reset requests
  if (session?.user?.id) {
    return NextResponse.json(
      { error: "Already authenticated" },
      { status: 400 }
    );
  }

  try {
    const { email, token, newPassword } = await request.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user and reset token by joining with PasswordResetToken
    const passwordReset = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        user: { email }, // Join with User model to check email
      },
      include: {
        user: { select: { id: true } }, // Select user ID
      },
    });

    if (!passwordReset) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: passwordReset.user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Delete the used reset token
    await prisma.passwordResetToken.delete({
      where: { id: passwordReset.id },
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Handle password reset email request
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate reset token and expiry (e.g., 1 hour expiry)
    const resetToken = crypto.randomUUID();
    const expiry = new Date(Date.now() + 3600 * 1000);

    // Create a new PasswordResetToken entry
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: expiry,
      },
    });

    // Generate reset link (adjust the base URL as needed)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${email}`;

    // Send email to user
    await transporter.sendMail({
      from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      text: `
        You have requested to reset your password for IUL Calculator Pro.

        Please click the following link to reset your password:
        ${resetLink}

        This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
      `,
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password for IUL Calculator Pro.</p>
        <p>Please click the following link to reset your password:</p>
        <p><a href="${resetLink}" target="_blank">Reset Password</a></p>
        <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
      `,
    });

    return NextResponse.json({ message: "Password reset link sent" });
  } catch (error) {
    console.error("Error generating reset link:", error);
    return NextResponse.json(
      { error: "Failed to generate reset link" },
      { status: 500 }
    );
  }
}
