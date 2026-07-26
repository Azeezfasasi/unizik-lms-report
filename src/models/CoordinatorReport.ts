import { Schema, model, models } from "mongoose";

const CoordinatorReportSchema = new Schema(
  {
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    preparedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    academicSession: { type: String, required: true },
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },
    totalStudents: { type: Number, default: 0 },
    totalCourses: { type: Number, default: 0 },
    lectureComplianceRate: { type: Number, default: 0 },
    lecturerResponseRate: { type: Number, min: 0, max: 100, default: 0 },
    misconductSeverity: { type: String, enum: ["NONE", "MINOR", "SERIOUS"], default: "NONE" },
    generalComments: { type: String },
    examinerReportsSummary: {
      submitted: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      pending: { type: Number, default: 0 },
    },
    examTimetableStatus: { type: String },
    recommendations: { type: String },
    status: { type: String, enum: ["DRAFT", "SUBMITTED"], default: "DRAFT" },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

CoordinatorReportSchema.index({ curriculumId: 1, academicSession: 1, semester: 1 });

export default models.CoordinatorReport || model("CoordinatorReport", CoordinatorReportSchema);
