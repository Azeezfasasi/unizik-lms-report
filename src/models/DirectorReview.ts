import { Schema, model, models } from "mongoose";

const DirectorReviewSchema = new Schema(
  {
    period: { type: String, required: true },
    academicSession: { type: String },
    semester: { type: String, enum: ["FIRST", "SECOND"] },
    includedReports: [{ type: Schema.Types.ObjectId, ref: "Report" }],
    generatedFile: { type: Schema.Types.ObjectId, ref: "GeneratedReportFile" },
    sentBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sentToEmail: { type: String, required: true },
    sentToName: { type: String },
    subject: { type: String, required: true },
    htmlContent: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

DirectorReviewSchema.index({ period: 1, academicSession: 1, semester: 1 });
DirectorReviewSchema.index({ sentToEmail: 1 });

export default models.DirectorReview || model("DirectorReview", DirectorReviewSchema);
