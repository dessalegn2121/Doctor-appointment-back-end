import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDoctorNotification extends Document {
  doctorId: Types.ObjectId;
  title: string;
  message: string;
  type: "appointment" | "patient" | "prescription" | "system" | "message";
  relatedId?: Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  priority: "low" | "normal" | "high";
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const doctorNotificationSchema = new Schema<IDoctorNotification>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["appointment", "patient", "prescription", "system", "message"], required: true },
    relatedId: Schema.Types.ObjectId,
    isRead: { type: Boolean, default: false },
    readAt: Date,
    priority: { type: String, enum: ["low", "normal", "high"], default: "normal" },
    actionUrl: String,
  },
  { timestamps: true }
);

doctorNotificationSchema.index({ doctorId: 1, isRead: 1 });
doctorNotificationSchema.index({ doctorId: 1, createdAt: -1 });

export default mongoose.model<IDoctorNotification>("DoctorNotification", doctorNotificationSchema);
