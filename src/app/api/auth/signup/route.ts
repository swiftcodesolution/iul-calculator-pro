import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/connect";
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

const signupApiSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  cellPhone: z.string().min(1),
  officePhone: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, cellPhone, officePhone } =
      signupApiSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { cellPhone }, { officePhone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
      if (existingUser.cellPhone === cellPhone) {
        return NextResponse.json(
          { error: "User with this cell phone already exists" },
          { status: 409 }
        );
      }
      if (existingUser.officePhone === officePhone) {
        return NextResponse.json(
          { error: "User with this office phone already exists" },
          { status: 409 }
        );
      }
    }

    // const hashedPassword = await bcrypt.hash(password, 10); // Uncomment when bcrypt is added

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password, // Replace with hashedPassword when bcrypt is used
        firstName,
        lastName,
        cellPhone,
        officePhone,
      },
    });

    // Send email to admin
    await transporter.sendMail({
      from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New User Signup",
      text: `
        A new user has signed up.
        
        Name: ${firstName} ${lastName}
        Email: ${email}
        Cell Phone: ${cellPhone}
        Office Phone: ${officePhone}
        Signed Up At: ${new Date().toLocaleString()}
      `,
      html: `
        <h2>New User Signup</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Cell Phone:</strong> ${cellPhone}</p>
        <p><strong>Office Phone:</strong> ${officePhone}</p>
        <p><strong>Signed Up At:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    // Send welcome email to user
    await transporter.sendMail({
      from: `"IUL Calculator Pro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to IUL Calculator Pro!",
      text: `
        Hi ${firstName},

        Welcome to IUL Calculator Pro! Your account has been successfully created.
        
        Name: ${firstName} ${lastName}
        Email: ${email}
        Cell Phone: ${cellPhone}
        
        Thank you for joining us!
      `,
      html: `
        <h2>Welcome to IUL Calculator Pro!</h2>
        <p>Hi ${firstName},</p>
        <p>Your account has been successfully created.</p>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Cell Phone:</strong> ${cellPhone}</p>
        <p>Thank you for joining us!</p>
      `,
    });

    return NextResponse.json(
      {
        message: "Signup successful",
        user: { id: user.id, email: user.email, firstName, lastName },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    const message =
      error instanceof z.ZodError
        ? "Invalid input data"
        : error instanceof Error
        ? error.message
        : "Signup failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
