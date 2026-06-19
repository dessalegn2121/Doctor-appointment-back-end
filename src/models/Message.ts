import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  senderRole: "patient" | "doctor";
  receiverId: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  message: string;
  attachmentUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["patient", "doctor"], required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    message: { type: String, required: true },
    attachmentUrl: String,
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 });

export default mongoose.model<IMessage>("Message", messageSchema);
