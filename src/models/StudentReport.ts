import { Schema, model, models } from "mongoose";

const StudentReportSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    preparedBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },
    submittedAt: { type: Date },
    teachingQuality: { type: Number, min: 1, max: 5, default: 3 },
    examPreparedness: { type: Number, min: 1, max: 5, default: 3 },
    courseMaterialsRating: { type: Number, min: 1, max: 5, default: 3 },
    lectureFeedback: { type: String },
    examFeedback: { type: String },
    instructorFeedback: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

StudentReportSchema.index({ studentId: 1, facultyId: 1, curriculumId: 1 });

export default models.StudentReport || model("StudentReport", StudentReportSchema);