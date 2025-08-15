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
      const reminderDays = [60, 30, 10];

      if (reminderDays.includes(daysUntilExpiration)) {
        /*
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
        */

        await transporter.sendMail({
          from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
          to: trial.user.email,
          subject:
            daysUntilExpiration === 30
              ? "30 Days In – Have You Submitted Your IUL Case?"
              : "Final Countdown – 10 Days Left to Qualify for Free Pro Access",
          text:
            daysUntilExpiration === 30
              ? `
          Hi ${trial.user.firstName},

          You’re now 30 days into your Calculator Pro trial. Submitting just one IUL case under our agency keeps your access free—but there’s one critical step:

          ⚠️ You must tell Shawn Van Stratten you're joining through "IUL Calculator Pro"—this is required to convert your trial to free access.

          Get Appointed ASAP:
          📧 svanstratten@truchoicefinancial.com
          📞 561.472.9792
          🧾 Carriers: Allianz, Minnesota Life, LSW, North American, Nationwide, Penn Mutual, Symetra, Columbus Life

          At Day 60:
          ✅ One IUL sale with proper affiliation = full access at no cost
          ❌ No sale or missing affiliation = $100/month or $1,000/year

          ▶️ Watch the training walkthrough to get the most out of Pro.
          https://adilo.bigcommand.com/watch/opUQ_aSf

          You’ve got time to lock this in. Let’s keep it moving.

          – Steve
        `
              : `
          Hi ${trial.user.firstName},

          Your 60-day trial ends in 10 days. To avoid being switched to a paid plan, make sure to:
          ✅ Submit one IUL sale under our agency
          ✅ Tell Shawn Van Stratten you’re joining under "IUL Calculator Pro"

          This is critical—without both steps, your free trial will not convert to permanent access.

          Contact Shawn Now:
          📧 svanstratten@truchoicefinancial.com
          📞 561.472.9792
          🏢 TruChoice Financial
          🧾 Carriers: Allianz, Minnesota Life, LSW, North American, Nationwide, Penn Mutual, Symetra, Columbus Life
          ⚠️ Be clear: You’re part of "IUL Calculator Pro"

          ▶️ Catch the Pro training replay if you haven’t already.

          This tool gives you the leverage—now it’s time to seal the deal.

          – Steve
        `,
          html:
            daysUntilExpiration === 30
              ? `
          <h2>30 Days In – Have You Submitted Your IUL Case?</h2>
          <p>Hi ${trial.user.firstName},</p>
          <p>You’re now 30 days into your Calculator Pro trial. Submitting just one IUL case under our agency keeps your access free—but there’s one critical step:</p>
          <p>⚠️ You must tell Shawn Van Stratten you're joining through "IUL Calculator Pro"—this is required to convert your trial to free access.</p>
          <p><strong>Get Appointed ASAP:</strong></p>
          <p>📧 <a href="mailto:svanstratten@truchoicefinancial.com">svanstratten@truchoicefinancial.com</a><br>
          📞 561.472.9792<br>
          🧾 Carriers: Allianz, Minnesota Life, LSW, North American, Nationwide, Penn Mutual, Symetra, Columbus Life</p>
          <p>At Day 60:</p>
          <p>✅ One IUL sale with proper affiliation = full access at no cost<br>
          ❌ No sale or missing affiliation = $100/month or $1,000/year</p>
          <p>▶️ Watch the training walkthrough to get the most out of Pro.<br>
          <a href="https://adilo.bigcommand.com/watch/opUQ_aSf">https://adilo.bigcommand.com/watch/opUQ_aSf</a></p>
          <p>You’ve got time to lock this in. Let’s keep it moving.</p>
          <p>– Steve</p>
        `
              : `
          <h2>Final Countdown – 10 Days Left to Qualify for Free Pro Access</h2>
          <p>Hi ${trial.user.firstName},</p>
          <p>Your 60-day trial ends in 10 days. To avoid being switched to a paid plan, make sure to:</p>
          <p>✅ Submit one IUL sale under our agency<br>
          ✅ Tell Shawn Van Stratten you’re joining under "IUL Calculator Pro"</p>
          <p>This is critical—without both steps, your free trial will not convert to permanent access.</p>
          <p><strong>Contact Shawn Now:</strong></p>
          <p>📧 <a href="mailto:svanstratten@truchoicefinancial.com">svanstratten@truchoicefinancial.com</a><br>
          📞 561.472.9792<br>
          🏢 TruChoice Financial<br>
          🧾 Carriers: Allianz, Minnesota Life, LSW, North American, Nationwide, Penn Mutual, Symetra, Columbus Life<br>
          ⚠️ Be clear: You’re part of "IUL Calculator Pro"</p>
          <p>▶️ Catch the Pro training replay if you haven’t already.</p>
          <p>This tool gives you the leverage—now it’s time to seal the deal.</p>
          <p>– Steve</p>
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
