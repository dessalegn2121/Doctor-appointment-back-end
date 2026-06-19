import mongoose, { Document, Schema, Types } from "mongoose";

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  recipientType: "patient" | "doctor" | "admin";
  type: "appointment" | "reminder" | "medical_report" | "announcement";
  title: string;
  message: string;
  referenceId?: Types.ObjectId;
  referenceModel?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true },
    recipientType: { type: String, enum: ["patient", "doctor", "admin"], required: true },
    type: { type: String, enum: ["appointment", "reminder", "medical_report", "announcement"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    referenceId: { type: Schema.Types.ObjectId },
    referenceModel: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
