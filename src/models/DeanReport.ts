import { Schema, model, models } from "mongoose";

const DECISION_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

const decisionSchema = new Schema(
  {
    status: { type: String, enum: DECISION_STATUSES, default: "PENDING" },
    comment: { type: String, default: "" },
  },
  { _id: false }
);

const DeanReportSchema = new Schema(
  {
    coordinatorReportId: { type: Schema.Types.ObjectId, ref: "CoordinatorReport", required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewerRole: { type: String, enum: ["ADMIN", "DEAN", "SUB_DEAN"], required: true },
    studentLectureResponse: { type: decisionSchema, default: () => ({}) },
    studentAssignmentResponse: { type: decisionSchema, default: () => ({}) },
    studentQuizResponse: { type: decisionSchema, default: () => ({}) },
    studentCourseworkResponse: { type: decisionSchema, default: () => ({}) },
    weeklySyllabusCovered: { type: decisionSchema, default: () => ({}) },
    courseMaterialsReleased: { type: decisionSchema, default: () => ({}) },
    examReadiness: { type: decisionSchema, default: () => ({}) },
    supervisorActiveness: { type: decisionSchema, default: () => ({}) },
    studentProgression: { type: decisionSchema, default: () => ({}) },
    overallStatus: { type: String, enum: DECISION_STATUSES, default: "PENDING" },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

DeanReportSchema.index({ coordinatorReportId: 1, reviewerRole: 1 }, { unique: true });
DeanReportSchema.index({ facultyId: 1, departmentId: 1, createdAt: -1 });

export default models.DeanReport || model("DeanReport", DeanReportSchema);