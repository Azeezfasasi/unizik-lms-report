import { Schema, model, models } from "mongoose";

const GeneratedReportFileSchema = new Schema(
  {
    reportType: {
      type: String,
      enum: ["STUDENT", "LMS_REP", "PG_COORDINATOR", "EXAMINER", "SUPERVISOR", "DIRECTOR"],
      required: true,
    },
    sourceId: { type: Schema.Types.ObjectId },
    format: { type: String, enum: ["PDF", "DOCX", "XLSX"], required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty" },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    sentAt: { type: Date },
    sentToEmail: { type: String },
  },
  { timestamps: true }
);

GeneratedReportFileSchema.index({ reportType: 1, sourceId: 1, format: 1 });
GeneratedReportFileSchema.index({ createdAt: -1 });

export default models.GeneratedReportFile || model("GeneratedReportFile", GeneratedReportFileSchema);
