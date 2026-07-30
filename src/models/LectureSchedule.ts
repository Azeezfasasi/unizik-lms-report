import { Schema, model, models } from "mongoose";

const LectureScheduleSchema = new Schema(
  {
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default models.LectureSchedule || model("LectureSchedule", LectureScheduleSchema);
