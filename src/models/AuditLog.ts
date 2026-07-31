import { Schema, model, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, default: "Unknown" },
    userEmail: { type: String },
    userRole: { type: String },
    action: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ["SUCCESS", "FAILURE"], default: "SUCCESS" },
    description: { type: String, required: true },
    entityType: { type: String },
    entityId: { type: String },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ category: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export default models.AuditLog || model("AuditLog", AuditLogSchema);
