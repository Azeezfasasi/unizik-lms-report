import { Schema, model, models } from "mongoose";

const CurriculumSchema = new Schema(
  {
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    programName: { type: String, required: true },
    level: { type: String },
    version: { type: String, default: "1.0" },
    documentUrl: { type: String },
  },
  { timestamps: true }
);

export default models.Curriculum || model("Curriculum", CurriculumSchema);
