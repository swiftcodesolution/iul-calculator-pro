// import { NextResponse } from "next/server";
// import { z } from "zod";
// import prisma from "@/lib/connect";

/*
const updateFingerprintSchema = z.object({
  email: z.string().email(),
  deviceFingerprint: z.string().min(1).max(255),
});
*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function PATCH(request: Request) {
  try {
    /*
    const body = await request.json();

    const { email, deviceFingerprint } = updateFingerprintSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { deviceFingerprint },
    });

    return NextResponse.json(
      {
        message: "Device fingerprint updated",
        deviceFingerprint: updatedUser.deviceFingerprint,
      },
      { status: 200 }
    );
    */
  } catch (error) {
    console.error("Update fingerprint error:", error);

    /*
    const message =
      error instanceof z.ZodError
        ? "Invalid input data"
        : error instanceof Error
        ? error.message
        : "Fingerprint update failed";

    return NextResponse.json({ error: message }, { status: 500 });
    */
  }
}
