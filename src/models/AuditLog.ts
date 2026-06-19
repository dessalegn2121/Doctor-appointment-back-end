import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  action: string;
  module: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure";
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    changes: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    status: { type: String, enum: ["success", "failure"], default: "success" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Index for faster queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ module: 1, action: 1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
