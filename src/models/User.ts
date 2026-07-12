import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["ADMIN", "FACULTY_OFFICER", "EXAMINER", "STUDENT"],
      default: "STUDENT",
    },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
