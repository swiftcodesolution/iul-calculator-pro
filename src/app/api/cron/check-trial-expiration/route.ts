import { NextResponse } from "next/server";
import checkTrialExpiration from "@/scripts/checkTrialExpiration";

export async function GET() {
  try {
    await checkTrialExpiration();
    return NextResponse.json({ message: "Trial expiration check completed" });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to run cron job" },
      { status: 500 }
    );
  }
}
