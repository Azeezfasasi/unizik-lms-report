import { Schema, model, models } from "mongoose";

const ReportSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum" },
    status: { type: String, enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED", "REJECTED"], default: "DRAFT" },
    preparedBy: { type: Schema.Types.ObjectId, ref: "User" },
    submittedAt: { type: Date },
    notes: { type: String },
    teachingQuality: { type: Number, min: 1, max: 5, default: 3 },
    examPreparedness: { type: Number, min: 1, max: 5, default: 3 },
    courseMaterialsRating: { type: Number, min: 1, max: 5, default: 3 },
    lectureFeedback: { type: String },
    examFeedback: { type: String },
    instructorFeedback: { type: String },
  },
  { timestamps: true }
);

export default models.Report || model("Report", ReportSchema);
