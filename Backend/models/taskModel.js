import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, default: new Date() },
    priority: {
      type: String,
      default: "normal",
      enum: ["high", "medium", "normal", "low"],
    },
    stage: {
      type: String,
      default: "todo",
      enum: ["todo", "in progress", "completed"],
    },
    activities: [
      {
        type: {
          type: String,
          default: "assigned",
          enum: [
            "assigned",
            "started",
            "in progress",
            "bug",
            "completed",
            "commented",
          ],
        },
        activity: String,
        date: { type: Date, default: new Date() },
        by: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    subTasks: [
      {
        title: String,
        date: Date,
        tag: String,
        subteam:[{ type: Schema.Types.ObjectId, ref: "User" }],
        isCompleted: Boolean,
      },
    ],
    description: String,
    assets: [{ type: String }],
    links: [String],
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    screenshots: [
      {
        data: Buffer, // The actual screenshot data
        uploadedAt: { type: Date, default: Date.now } // Timestamp when the screenshot is added
      }
    ],
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }

);

const Task = mongoose.model("Task", taskSchema);

export default Task;
