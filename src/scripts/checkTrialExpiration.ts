import prisma from "@/lib/connect";
import { createTransporter } from "@/lib/nodemailer";

async function checkTrialExpiration() {
  try {
    const transporter = await createTransporter();

    // Find subscriptions that are expired or trialing past renewal date
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        OR: [
          { status: "expired" },
          {
            status: "trialing",
            renewalDate: { lte: new Date() },
          },
        ],
        user: { status: { not: "suspended" } },
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    for (const subscription of expiredSubscriptions) {
      // Check if user exists
      if (!subscription.user) {
        console.error(`No user found for subscription ${subscription.id}`);
        continue; // Skip to next subscription
      }

      // Update user status to suspended
      await prisma.user.update({
        where: { id: subscription.userId },
        data: { status: "suspended" },
      });

      // Update or create TrialToken to mark as expired
      const trialToken = await prisma.trialToken.findUnique({
        where: { userId: subscription.userId },
      });

      if (trialToken) {
        await prisma.trialToken.update({
          where: { id: trialToken.id },
          data: { expiresAt: new Date() }, // Mark as expired
        });
      } else {
        await prisma.trialToken.create({
          data: {
            userId: subscription.userId,
            token: Math.random().toString(36).substring(2),
            expiresAt: new Date(), // Already expired
          },
        });
      }

      // Notify admin
      await transporter.sendMail({
        from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "User Account Suspended",
        text: `
          User Account Suspended:
          Name: ${subscription.user.firstName || ""} ${
          subscription.user.lastName || ""
        }
          Email: ${subscription.user.email}
          User ID: ${subscription.userId}
          Subscription Status: ${subscription.status}
          Renewal Date: ${subscription.renewalDate?.toLocaleString() || "N/A"}
        `,
        html: `
          <h2>User Account Suspended</h2>
          <p><strong>Name:</strong> ${subscription.user.firstName || ""} ${
          subscription.user.lastName || ""
        }</p>
          <p><strong>Email:</strong> ${subscription.user.email}</p>
          <p><strong>User ID:</strong> ${subscription.userId}</p>
          <p><strong>Subscription Status:</strong> ${subscription.status}</p>
          <p><strong>Renewal Date:</strong> ${
            subscription.renewalDate?.toLocaleString() || "N/A"
          }</p>
        `,
      });

      // Notify user
      await transporter.sendMail({
        from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
        to: subscription.user.email,
        subject: "Your Trial Has Expired",
        text: `
          Dear ${subscription.user.firstName || ""} ${
          subscription.user.lastName || ""
        },
          Your trial has expired. Please subscribe or contact the admin to reactivate your account.
          User ID: ${subscription.userId}
          Renewal Date: ${subscription.renewalDate?.toLocaleString() || "N/A"}
        `,
        html: `
          <h2>Your Trial Has Expired</h2>
          <p>Dear ${subscription.user.firstName || ""} ${
          subscription.user.lastName || ""
        },</p>
          <p>Your trial has expired. Please subscribe or contact the admin to reactivate your account.</p>
          <p><strong>User ID:</strong> ${subscription.userId}</p>
          <p><strong>Renewal Date:</strong> ${
            subscription.renewalDate?.toLocaleString() || "N/A"
          }</p>
        `,
      });

      console.log(
        `Suspended user ${subscription.userId} and notified admin and user`
      );
    }
  } catch (error) {
    console.error("Error checking trial expirations:", error);
  }
}

export default checkTrialExpiration;
