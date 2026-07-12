import { Schema, model, models } from "mongoose";

const StudentSchema = new Schema(
  {
    matricNumber: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty" },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    curriculumId: { type: Schema.Types.ObjectId, ref: "Curriculum" },
    programLevel: { type: String },
    photoUrl: { type: String },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "GRADUATED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default models.Student || model("Student", StudentSchema);
