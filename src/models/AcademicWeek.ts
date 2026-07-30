import { Schema, model, models } from "mongoose";

const AcademicWeekSchema = new Schema(
  {
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    academicSession: { type: String, required: true },
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },
    weekNumber: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    label: { type: String },
  },
  { timestamps: true }
);

AcademicWeekSchema.index(
  { curriculumId: 1, courseId: 1, academicSession: 1, semester: 1, weekNumber: 1 },
  { unique: true }
);

export default models.AcademicWeek || model("AcademicWeek", AcademicWeekSchema);
