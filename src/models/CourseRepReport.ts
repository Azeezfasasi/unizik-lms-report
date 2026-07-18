import { Schema, model, models } from "mongoose";

const LectureComplianceSchema = new Schema(
  {
    lectureScheduleId: { type: Schema.Types.ObjectId, ref: "LectureSchedule", required: true },
    held: { type: Boolean, default: false },
    remarks: { type: String },
  },
  { _id: false }
);

const CourseRepReportSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    academicSession: { type: String, required: true },
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },
    lectureCompliance: { type: [LectureComplianceSchema], default: [] },
    totalLecturesScheduled: { type: Number, default: 0 },
    totalLecturesHeld: { type: Number, default: 0 },
    issues: { type: String },
    status: { type: String, enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED", "REJECTED"], default: "DRAFT" },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

CourseRepReportSchema.index({ courseId: 1, academicSession: 1, semester: 1 });

export default models.CourseRepReport || model("CourseRepReport", CourseRepReportSchema);
