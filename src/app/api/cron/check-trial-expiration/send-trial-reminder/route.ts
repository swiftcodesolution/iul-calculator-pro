import { NextResponse } from "next/server";
import sendTrialReminder from "@/scripts/sendTrialReminder";

export async function GET() {
  try {
    await sendTrialReminder();
    return NextResponse.json({ message: "Trial reminder check completed" });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Failed to run cron job" },
      { status: 500 }
    );
  }
}
