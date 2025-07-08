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

async function sendTrialReminder() {
  try {
    const trials = await prisma.trialToken.findMany({
      where: {
        expiresAt: { gte: new Date() },
        user: { status: { not: "suspended" } },
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    const now = new Date();
    for (const trial of trials) {
      const daysUntilExpiration = Math.ceil(
        (trial.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const reminderDays = [60, 30, 7];

      if (reminderDays.includes(daysUntilExpiration)) {
        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: trial.user.email,
          subject: `IUL Trial Reminder: ${daysUntilExpiration} Days Left`,
          text: `
        Dear ${trial.user.firstName || ""} ${trial.user.lastName || ""},
        Your IUL trial expires in ${daysUntilExpiration} days on ${trial.expiresAt.toLocaleString()}.
        To avoid auto-cancellation, submit an IUL sale confirmation or subscribe (monthly/annually).
        Contact support for assistance.
      `,
          html: `
        <h2>IUL Trial Reminder</h2>
        <p><strong>Name:</strong> ${trial.user.firstName || ""} ${
            trial.user.lastName || ""
          }</p>
        <p><strong>Email:</strong> ${trial.user.email}</p>
        <p>Your IUL trial expires in <strong>${daysUntilExpiration} days</strong> on ${trial.expiresAt.toLocaleString()}.</p>
        <p>To avoid auto-cancellation, submit an IUL sale confirmation or subscribe (monthly or annually).</p>
        <p>Contact support for assistance.</p>
      `,
        });

        console.log(
          `Sent reminder to user ${trial.userId} (${daysUntilExpiration} days left)`
        );
      }
    }
  } catch (error) {
    console.error("Error sending trial reminders:", error);
  }
}

export default sendTrialReminder;
