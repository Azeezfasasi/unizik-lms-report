import { Schema, model, models } from "mongoose";

const ReportDiscussionSchema = new Schema(
  {
    reportType: { type: String, required: true },
    reportId: { type: Schema.Types.ObjectId, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    attachmentUrl: { type: String },
  },
  { timestamps: true }
);

ReportDiscussionSchema.index({ reportType: 1, reportId: 1, createdAt: 1 });

export default models.ReportDiscussion || model("ReportDiscussion", ReportDiscussionSchema);