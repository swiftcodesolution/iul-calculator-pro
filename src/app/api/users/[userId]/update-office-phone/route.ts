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
  const { officePhone } = await request.json();

  if (typeof officePhone !== "string") {
    return NextResponse.json(
      { error: "Invalid office phone" },
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
      data: { officePhone: officePhone || null },
    });

    const transporter = await createTransporter();
    const subject = "Your Office Phone Has Been Updated";

    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      text: `Your office phone has been updated by an admin to ${
        officePhone || "removed"
      }.`,
      html: `
        <h2>Office Phone Updated</h2>
        <p>Your office phone has been updated by an admin.</p>
        <p><strong>New Office Phone:</strong> ${officePhone || "removed"}</p>
      `,
    });

    await prisma.emailLog.create({
      data: {
        userId,
        emailType: "office_phone_update",
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
    console.error("Update office phone error:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.emailLog.create({
        data: {
          userId,
          emailType: "office_phone_update",
          recipient: user.email || "",
          subject: "Office Phone Update Notification",
          status: "failed",
          errorMessage,
          sentAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to update office phone" },
      { status: 500 }
    );
  }
}
