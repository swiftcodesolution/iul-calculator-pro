import { NextResponse } from "next/server";
import { z } from "zod";
// import bcrypt from "bcrypt";
import prisma from "@/lib/connect";

const signupApiSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  cellPhone: z.string().min(1),
  officePhone: z.string().min(1),

  // deviceFingerprint: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      cellPhone,
      officePhone,

      // deviceFingerprint,
    } = signupApiSchema.parse(body);

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

    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password,
        firstName,
        lastName,
        cellPhone,
        officePhone,

        // deviceFingerprint,
      },
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
