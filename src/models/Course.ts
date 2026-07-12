import { Schema, model, models } from "mongoose";

const CourseSchema = new Schema(
  {
    title: { type: String, required: true },
    code: { type: String, required: true },
    units: { type: Number, required: true },
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum" },
  },
  { timestamps: true }
);

export default models.Course || model("Course", CourseSchema);
