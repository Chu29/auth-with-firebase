import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
    const { uid } = decodedToken;

    // Revoke all refresh tokens for the user
    await adminAuth.revokeRefreshTokens(uid);

    // Clear the session cookie
    (await cookies()).delete("session");

    return NextResponse.json({ status: "All sessions revoked successfully" });
  } catch (error) {
    console.error("Error revoking sessions:", error);
    return NextResponse.json(
      { error: "Failed to revoke sessions" },
      { status: 500 },
    );
  }
}
