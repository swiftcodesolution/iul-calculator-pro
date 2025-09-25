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
  const { cellPhone } = await request.json();

  if (typeof cellPhone !== "string") {
    return NextResponse.json({ error: "Invalid cell phone" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { cellPhone: cellPhone || null },
    });

    const transporter = await createTransporter();
    const subject = "Your Cell Phone Has Been Updated";

    await transporter.sendMail({
      from: `"Support" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject,
      text: `Your cell phone has been updated by an admin to ${
        cellPhone || "removed"
      }.`,
      html: `
        <h2>Cell Phone Updated</h2>
        <p>Your cell phone has been updated by an admin.</p>
        <p><strong>New Cell Phone:</strong> ${cellPhone || "removed"}</p>
      `,
    });

    await prisma.emailLog.create({
      data: {
        userId,
        emailType: "cell_phone_update",
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
    console.error("Update cell phone error:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.emailLog.create({
        data: {
          userId,
          emailType: "cell_phone_update",
          recipient: user.email || "",
          subject: "Cell Phone Update Notification",
          status: "failed",
          errorMessage,
          sentAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to update cell phone" },
      { status: 500 }
    );
  }
}
