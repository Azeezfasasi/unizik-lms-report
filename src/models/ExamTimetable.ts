import { Schema, model, models } from "mongoose";

const ExamTimetableSchema = new Schema(
  {
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export default models.ExamTimetable || model("ExamTimetable", ExamTimetableSchema);
