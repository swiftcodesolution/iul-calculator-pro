import { NextResponse } from "next/server";
import prisma from "@/lib/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hash } from "bcrypt"; // Assuming bcrypt is used for password hashing

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

    // Verify user and reset token
    const user = await prisma.user.findFirst({
      where: {
        email,
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
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
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate reset token and expiry (e.g., 1 hour expiry)
    const resetToken = crypto.randomUUID();
    const expiry = new Date(Date.now() + 3600 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expiry,
      },
    });

    // TODO: Implement email sending logic (e.g., using nodemailer or an email service)
    console.log(
      `Password reset link: /reset-password?token=${resetToken}&email=${email}`
    );

    return NextResponse.json({ message: "Password reset link sent" });
  } catch (error) {
    console.error("Error generating reset link:", error);
    return NextResponse.json(
      { error: "Failed to generate reset link" },
      { status: 500 }
    );
  }
}
