import { Schema, model, models } from "mongoose";

const WeeklyEntrySchema = new Schema(
  {
    weekId: { type: Schema.Types.ObjectId, ref: "AcademicWeek", required: true },
    lecturerEffectivenessRating: { type: Number, min: 0, max: 100, default: 50 },
    studentEffectivenessRating: { type: Number, min: 0, max: 100, default: 50 },
    remarks: { type: String },
  },
  { _id: false }
);

const WeeklyEffectivenessReportSchema = new Schema(
  {
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    preparedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    academicSession: { type: String, required: true },
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },
    weeklyEntries: { type: [WeeklyEntrySchema], default: [] },
    avgLecturerEffectiveness: { type: Number, default: 0 },
    avgStudentEffectiveness: { type: Number, default: 0 },
    generalComments: { type: String },
    status: { type: String, enum: ["DRAFT", "SUBMITTED"], default: "DRAFT" },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

WeeklyEffectivenessReportSchema.index({ curriculumId: 1, courseId: 1, academicSession: 1, semester: 1 });

export default models.WeeklyEffectivenessReport || model("WeeklyEffectivenessReport", WeeklyEffectivenessReportSchema);
