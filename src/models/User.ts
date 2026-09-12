import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["ADMIN", "FACULTY_OFFICER", "EXAMINER", "STUDENT", "LMS_REP", "PG_COORDINATOR", "SUPERVISOR", "DIRECTOR", "HOD", "DEAN", "SUB_DEAN", "ASSOCIATE_PROVOST"],
      default: "STUDENT",
    },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty" },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    associateProvostField: { type: String, enum: ["HEALTH", "SCIENCES", "HUMANITIES"] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
