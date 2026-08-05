import { Schema, model, models } from "mongoose";

const StudentReportSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    weekId: { type: Schema.Types.ObjectId, ref: "AcademicWeek", required: true },
    academicSession: { type: String, required: true },
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },
    preparedBy: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },
    submittedAt: { type: Date },
    teachingQuality: { type: Number, min: 1, max: 100, default: 60 },
    examPreparedness: { type: Number, min: 1, max: 100, default: 60 },
    courseMaterialsRating: { type: Number, min: 1, max: 100, default: 60 },
    lectureFeedback: { type: String },
    examFeedback: { type: String },
    instructorFeedback: { type: String },
    lmsPortalFeedback: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

StudentReportSchema.index({ studentId: 1, facultyId: 1, curriculumId: 1 });

export default models.StudentReport || model("StudentReport", StudentReportSchema);