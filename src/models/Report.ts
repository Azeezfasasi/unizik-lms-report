import { Schema, model, models } from "mongoose";

const ReportSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum" },
    status: { type: String, enum: ["DRAFT", "SUBMITTED"], default: "DRAFT" },
    preparedBy: { type: Schema.Types.ObjectId, ref: "User" },
    submittedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export default models.Report || model("Report", ReportSchema);
