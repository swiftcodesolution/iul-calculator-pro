import prisma from "@/lib/connect";
import { createTransporter } from "@/lib/nodemailer";

async function checkTrialExpiration() {
  try {
    const transporter = await createTransporter();

    const expiredTrials = await prisma.trialToken.findMany({
      where: {
        expiresAt: { lte: new Date() },
        user: { status: { not: "suspended" } },
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    for (const trial of expiredTrials) {
      await prisma.user.update({
        where: { id: trial.userId },
        data: { status: "suspended" },
      });

      await transporter.sendMail({
        from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL, // Steve’s email
        subject: "User Account Suspended",
        text: `
          User Account Suspended:
          Name: ${trial.user.firstName || ""} ${trial.user.lastName || ""}
          Email: ${trial.user.email}
          User ID: ${trial.userId}
          Trial Expired: ${trial.expiresAt.toLocaleString()}
        `,
        html: `
          <h2>User Account Suspended</h2>
          <p><strong>Name:</strong> ${trial.user.firstName || ""} ${
          trial.user.lastName || ""
        }</p>
          <p><strong>Email:</strong> ${trial.user.email}</p>
          <p><strong>User ID:</strong> ${trial.userId}</p>
          <p><strong>Trial Expired:</strong> ${trial.expiresAt.toLocaleString()}</p>
        `,
      });

      console.log(`Suspended user ${trial.userId} and notified admin`);
    }
  } catch (error) {
    console.error("Error checking trial expirations:", error);
  }
}

export default checkTrialExpiration;
