import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/config/mongodb";
import Activity from "@/lib/models/activitySchema";

export async function GET() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
    const { uid } = decodedToken;

    await dbConnect();

    // Fetch the 10 most recent activities for the user
    const activities = await Activity.find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}
