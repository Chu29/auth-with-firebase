import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-logger";

const SESSION_DURATION = 60 * 60 * 24 * 5 * 1000;

// called after the user has logged in, a secure session cookie is set
export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid } = decodedToken;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION,
    });

    (await cookies()).set("session", sessionCookie, {
      maxAge: SESSION_DURATION / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    // Log sign-in activity
    await logActivity(uid, "sign-in");

    return NextResponse.json({ status: "Session cookie created successfully" });
  } catch (error) {
    console.error("Error creating session cookie:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// called when the user logs out, clears the session cookie
export async function DELETE() {
  (await cookies()).delete("session");
  return NextResponse.json({ status: "success" });
}
