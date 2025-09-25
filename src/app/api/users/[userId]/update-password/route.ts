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
  const { password } = await request.json();

  if (!password) {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password },
    });

    const transporter = await createTransporter();
    const subject = "Your Password Has Been Reset by Admin";

    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      text: `Your password has been reset by an admin. Your new password is: ${password}. You can now log in using this password. Please change it after logging in for security.`,
      html: `
        <h2>Password Reset by Admin</h2>
        <p>Your password has been reset by an admin.</p>
        <p><strong>New Password:</strong> ${password}</p>
        <p>You can now log in using this password. For security, please change your password after logging in.</p>
      `,
    });

    await prisma.emailLog.create({
      data: {
        userId,
        emailType: "password_reset_admin",
        recipient: user.email,
        subject,
        status: "sent",
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error("Update password error:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.emailLog.create({
        data: {
          userId,
          emailType: "password_reset_admin",
          recipient: user.email,
          subject: "Password Reset Notification",
          status: "failed",
          errorMessage,
          sentAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}
