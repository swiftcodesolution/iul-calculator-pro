import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/connect";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.pathname.split("/").pop();

  const { email, newPassword } = await request.json();

  if (!token || !email || !newPassword) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (
      !resetToken ||
      resetToken.expiresAt < new Date() ||
      resetToken.user.email !== email
    ) {
      return NextResponse.json(
        { error: "Token expired or invalid" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: newPassword },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
