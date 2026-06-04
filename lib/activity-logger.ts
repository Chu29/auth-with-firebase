import dbConnect from "@/lib/config/mongodb";
import Activity from "@/lib/models/activitySchema";

type ActivityType = "sign-in" | "task-created" | "task-completed" | "task-deleted" | "task-updated";

export async function logActivity(userId: string, type: ActivityType, metadata?: { taskTitle?: string; taskId?: string }) {
  try {
    await dbConnect();
    await Activity.create({
      userId,
      type,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
