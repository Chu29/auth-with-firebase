import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/config/mongodb";
import Task from "@/lib/models/taskSchema";

async function GET() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
    const { uid } = decodedToken;

    await dbConnect();

    const tasks = await Task.find({ userId: uid });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

async function POST({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
    const { uid } = decodedToken;

    await dbConnect();

    const task = await Task.create({ userId: uid, title, description });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}

async function PATCH() {
  try {
  } catch (error) {}
}

async function DELETE() {
  try {
  } catch (error) {}
}
