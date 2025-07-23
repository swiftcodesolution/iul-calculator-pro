import { NextResponse } from "next/server";
import prisma from "@/lib/connect"; // Adjust path to your Prisma client setup

// Define the expected shape of the MongoDB raw query response
interface MongoDBRawResult {
  cursor?: {
    firstBatch?: Array<{
      _id: string;
      createdAt?: Date | null;
      updatedAt?: Date | null;
    }>;
  };
}

export async function POST() {
  try {
    // Step 1: Find users with null createdAt or updatedAt using raw MongoDB query
    const rawResult = (await prisma.$runCommandRaw({
      find: "users",
      filter: {
        $or: [{ createdAt: null }, { updatedAt: null }],
      },
    })) as MongoDBRawResult;

    // Step 2: Safely access cursor.firstBatch with fallback
    const usersWithNullDates = rawResult.cursor?.firstBatch ?? [];
    console.log(
      `Found ${usersWithNullDates.length} users with null createdAt or updatedAt.`
    );

    // Step 3: Update each user to set createdAt and updatedAt
    const now = new Date();
    for (const user of usersWithNullDates) {
      const userId = user._id;
      console.log(`Updating user with ID: ${userId}`);

      await prisma.user.update({
        where: { id: userId },
        data: {
          createdAt: user.createdAt ?? now, // Use existing createdAt if not null, else now
          updatedAt: user.updatedAt ?? now, // Use existing updatedAt if not null, else now
        },
      });
    }

    return NextResponse.json(
      {
        message: "User date fields sync completed successfully",
        usersProcessed: usersWithNullDates.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing user date fields:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
