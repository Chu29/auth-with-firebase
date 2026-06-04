import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/config/mongodb";
import User from "@/lib/models/userSchema";

export async function GET() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
    const { uid } = decodedToken;

    await dbConnect();

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Also get provider info from Firebase
    const firebaseUser = await adminAuth.getUser(uid);

    return NextResponse.json({ 
      user, 
      providers: firebaseUser.providerData.map(p => p.providerId)
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

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

export async function PATCH(req: Request) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
    const { uid } = decodedToken;

    const { displayName, photoURL, preferences } = await req.json();

    await dbConnect();

    const updateData: {
      displayName?: string;
      photoURL?: string;
      preferences?: {
        emailNotifications: boolean;
        overdueReminders: boolean;
      };
    } = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    if (preferences !== undefined) updateData.preferences = preferences;

    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      updateData,
      { new: true },
    );

    // Also update Firebase if profile info changed
    if (displayName !== undefined || photoURL !== undefined) {
      await adminAuth.updateUser(uid, {
        displayName,
        photoURL,
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
