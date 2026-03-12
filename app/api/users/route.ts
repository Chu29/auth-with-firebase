import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/config/mongodb";
import User from "@/lib/models/userSchema";

export async function POST() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
    const { uid, email, name, picture } = decodedToken;

    await dbConnect();

    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        firebaseUid: uid,
        email,
        displayName: name || email,
        photoURL: picture || "",
      },
      { upsert: true, new: true },
    );

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error creating/finding user:", error);
    return NextResponse.json(
      { error: "Failed to authenticate user" },
      { status: 500 },
    );
  }
}
