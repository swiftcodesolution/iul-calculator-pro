import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/connect";

const updateFingerprintSchema = z.object({
  email: z.string().email(),
  deviceFingerprint: z.string().min(1),
});

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    console.log("Request body:", body); // Debug

    const { email, deviceFingerprint } = updateFingerprintSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("User lookup result:", user); // Debug
    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(
      "Updating fingerprint for user:",
      email,
      "to:",
      deviceFingerprint
    ); // Debug
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { deviceFingerprint: deviceFingerprint },
    });

    console.log("Updated user:", updatedUser); // Debug
    return NextResponse.json(
      {
        message: "Device fingerprint updated",
        deviceFingerprint: updatedUser.deviceFingerprint,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update fingerprint error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
