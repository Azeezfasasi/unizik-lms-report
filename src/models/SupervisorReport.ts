import { Schema, model, models } from "mongoose";

const SupervisorReportSchema = new Schema(
  {
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    academicSession: { type: String, required: true },
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },
    studentResponseToLecturesPct: { type: Number, min: 0, max: 100, required: true },
    studentResponseToAssignmentsPct: { type: Number, min: 0, max: 100, required: true },
    studentResponseToQuizPct: { type: Number, min: 0, max: 100, required: true },
    studentResponseToCourseworkPct: { type: Number, min: 0, max: 100, required: true },
    comments: { type: String },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

SupervisorReportSchema.index({ facultyId: 1, departmentId: 1, academicSession: 1, semester: 1 });

export default models.SupervisorReport || model("SupervisorReport", SupervisorReportSchema);
