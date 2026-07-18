import { Schema, model, models } from "mongoose";

const GeneratedReportFileSchema = new Schema(
  {
    reportType: {
      type: String,
      enum: ["STUDENT", "LMS_REP", "PG_COORDINATOR", "EXAMINER"],
      required: true,
    },
    sourceId: { type: Schema.Types.ObjectId, required: true },
    format: { type: String, enum: ["PDF", "DOCX", "XLSX"], required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty" },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

GeneratedReportFileSchema.index({ reportType: 1, sourceId: 1, format: 1 });
GeneratedReportFileSchema.index({ createdAt: -1 });

export default models.GeneratedReportFile || model("GeneratedReportFile", GeneratedReportFileSchema);
