import { Schema, model, models } from "mongoose";

const FacultySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    associateProvostField: { type: String, enum: ["HEALTH", "SCIENCES", "HUMANITIES"] },
    dean: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default models.Faculty || model("Faculty", FacultySchema);
