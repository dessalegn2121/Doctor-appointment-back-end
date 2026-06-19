import mongoose, { Document, Schema, Types } from "mongoose";

export type NotificationType = "appointment" | "message" | "system" | "reminder" | "prescription";

export interface IPatientNotification extends Document {
  patientId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: Types.ObjectId;
  relatedModel?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const patientNotificationSchema = new Schema<IPatientNotification>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["appointment", "message", "system", "reminder", "prescription"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId },
    relatedModel: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

patientNotificationSchema.index({ patientId: 1, createdAt: -1 });
patientNotificationSchema.index({ patientId: 1, isRead: 1 });

export const PatientNotification = mongoose.model<IPatientNotification>(
  "PatientNotification",
  patientNotificationSchema
);
