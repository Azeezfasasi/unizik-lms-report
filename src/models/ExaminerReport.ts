import { Schema, model, models } from "mongoose";

const ExaminerReportSchema = new Schema(
  {
    examinerName: { type: String, required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty" },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    comments: { type: String },
    score: { type: Number, default: 0 },
    attachmentUrl: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default models.ExaminerReport || model("ExaminerReport", ExaminerReportSchema);
