import { Schema, model, models } from "mongoose";

const STATUS = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "APPROVED", "REJECTED"] as const;

const StatusHistorySchema = new Schema(
  {
    status: { type: String, enum: STATUS, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    comment: { type: String },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ExaminerReportSchema = new Schema(
  {
    // Who actually set the questions — a real account, not free text
    lecturerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Fallback only for external/guest examiners with no portal account
    externalExaminerName: { type: String },

    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },

    academicSession: { type: String, required: true }, // e.g. "2025/2026"
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },
    examType: { type: String, enum: ["CA", "EXAM", "MAKEUP", "RESIT"], required: true },

    // Questions and answers are two different artifacts — track them separately
    questionPaperUrl: { type: String },
    markingSchemeUrl: { type: String },
    numberOfQuestions: { type: Number },

    status: { type: String, enum: STATUS, default: "DRAFT" },
    statusHistory: { type: [StatusHistorySchema], default: [] },

    moderatorId: { type: Schema.Types.ObjectId, ref: "User" },
    moderatorComments: { type: String },
    moderatorScore: { type: Number, min: 0, max: 100 },

    malpracticeFlagged: { type: Boolean, default: false },
    complianceNotes: { type: String },

    comments: { type: String },
    score: { type: Number, default: 0, min: 0, max: 100 },

    submittedAt: { type: Date },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// Reporting/dashboard queries
ExaminerReportSchema.index({ facultyId: 1, departmentId: 1, academicSession: 1 });
ExaminerReportSchema.index({ lecturerId: 1, academicSession: 1 });
// Prevents duplicate/confused submissions for the same course+session+exam type
ExaminerReportSchema.index(
  { courseId: 1, academicSession: 1, semester: 1, examType: 1 },
  { unique: true }
);

export default models.ExaminerReport || model("ExaminerReport", ExaminerReportSchema);