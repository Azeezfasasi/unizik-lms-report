import { Schema, model, models } from "mongoose";

const TeachingAssignmentSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    lecturerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    academicSession: { type: String, required: true },
    semester: { type: String, enum: ["FIRST", "SECOND"], required: true },
  },
  { timestamps: true }
);

TeachingAssignmentSchema.index(
  { courseId: 1, academicSession: 1, semester: 1 },
  { unique: true }
);

export default models.TeachingAssignment || model("TeachingAssignment", TeachingAssignmentSchema);