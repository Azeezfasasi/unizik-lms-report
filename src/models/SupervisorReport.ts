import { Schema, model, models } from "mongoose";

const SupervisorReportSchema = new Schema(
  {
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    academicSession: { type: String, required: true },
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },
    projectTitle: { type: String, required: true, trim: true },
    milestone: { type: String, required: true, trim: true },
    progressSummary: { type: String, required: true, trim: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student" },
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
