import { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["INFO", "ALERT", "REMINDER"], default: "INFO" },
    isRead: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.Notification || model("Notification", NotificationSchema);
