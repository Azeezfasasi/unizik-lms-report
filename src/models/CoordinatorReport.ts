import { Schema, model, models } from "mongoose";

const CoordinatorReportSchema = new Schema(
  {
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    weekId: { type: Schema.Types.ObjectId, ref: "AcademicWeek", required: true },
    preparedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    reportFrequency: { type: String, enum: ["WEEKLY"], default: "WEEKLY" },
    reportRole: { type: String, enum: ["HOD", "PG_COORDINATOR"], default: "PG_COORDINATOR" },
    academicSession: { type: String, required: true },
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },
    totalStudents: { type: Number, default: 0 },
    totalCourses: { type: Number, default: 0 },
    lectureComplianceRate: { type: Number, default: 0 },
    lecturerResponseRate: { type: Number, min: 0, max: 100, default: 0 },
    studentLectureResponseLow: { type: Number, min: 0, max: 100, default: 0 },
    studentLectureResponseAverage: { type: Number, min: 0, max: 100, default: 0 },
    studentLectureResponseHigh: { type: Number, min: 0, max: 100, default: 0 },
    studentAssignmentResponseLow: { type: Number, min: 0, max: 100, default: 0 },
    studentAssignmentResponseAverage: { type: Number, min: 0, max: 100, default: 0 },
    studentAssignmentResponseHigh: { type: Number, min: 0, max: 100, default: 0 },
    studentQuizResponseLow: { type: Number, min: 0, max: 100, default: 0 },
    studentQuizResponseAverage: { type: Number, min: 0, max: 100, default: 0 },
    studentQuizResponseHigh: { type: Number, min: 0, max: 100, default: 0 },
    studentCourseworkResponseLow: { type: Number, min: 0, max: 100, default: 0 },
    studentCourseworkResponseAverage: { type: Number, min: 0, max: 100, default: 0 },
    studentCourseworkResponseHigh: { type: Number, min: 0, max: 100, default: 0 },
    weeklySyllabusCoveredRate: { type: Number, min: 0, max: 100, default: 0 },
    courseMaterialsReleasedRate: { type: Number, min: 0, max: 100, default: 0 },
    examReadinessRate: { type: Number, min: 0, max: 100, default: 0 },
    supervisorActivesRate: { type: Number, min: 0, max: 100, default: 0 },
    studentProgressionRate: { type: Number, min: 0, max: 100, default: 0 },
    misconductSeverity: { type: String, enum: ["NONE", "MINOR", "SERIOUS"], default: "NONE" },
    generalComments: { type: String },
    examinerReportsSummary: {
      submitted: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    examTimetableStatus: { type: String },
    recommendations: { type: String },
    status: { type: String, enum: ["DRAFT", "PENDING", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED", "REJECTED"], default: "DRAFT" },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

CoordinatorReportSchema.index({ curriculumId: 1, academicSession: 1, semester: 1 });

export default models.CoordinatorReport || model("CoordinatorReport", CoordinatorReportSchema);
