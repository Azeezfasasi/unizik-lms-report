import { Schema, model, models } from "mongoose";

const AcademicSessionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    isCurrent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.AcademicSession || model("AcademicSession", AcademicSessionSchema);
