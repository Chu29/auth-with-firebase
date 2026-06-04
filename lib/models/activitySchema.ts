import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    type: {
      type: String,
      enum: ["sign-in", "task-created", "task-completed", "task-deleted", "task-updated"],
      required: true,
    },
    metadata: {
      taskTitle: String,
      taskId: String,
    },
  },
  { timestamps: true },
);

const Activity = mongoose.models.Activity || mongoose.model("Activity", activitySchema);

export default Activity;
