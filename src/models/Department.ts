import { Schema, model, models } from "mongoose";

const DepartmentSchema = new Schema(
  {
    name: { type: String, required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
    hod: { type: String },
  },
  { timestamps: true }
);

export default models.Department || model("Department", DepartmentSchema);
