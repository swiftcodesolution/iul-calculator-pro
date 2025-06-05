import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "@/lib/connect";

const signupApiSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  deviceFingerprint: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, deviceFingerprint } =
      signupApiSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        deviceFingerprint,
      },
    });

    return NextResponse.json({ message: "Signup successful" }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
