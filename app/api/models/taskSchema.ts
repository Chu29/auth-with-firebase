import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["uncompleted", "completed"],
    default: "uncompleted",
  },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
