import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPatientMessage extends Document {
  senderId: Types.ObjectId;
  senderType: "patient" | "doctor";
  receiverId: Types.ObjectId;
  receiverType: "patient" | "doctor";
  conversationId: Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  lastMessage: string;
  lastMessageTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const patientMessageSchema = new Schema<IPatientMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderType: { type: String, enum: ["patient", "doctor"], required: true },
    receiverId: { type: Schema.Types.ObjectId, required: true },
    receiverType: { type: String, enum: ["patient", "doctor"], required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const conversationSchema = new Schema<IConversation>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    lastMessage: { type: String },
    lastMessageTime: { type: Date },
  },
  { timestamps: true }
);

patientMessageSchema.index({ conversationId: 1, createdAt: -1 });
patientMessageSchema.index({ receiverId: 1, isRead: 1 });
conversationSchema.index({ patientId: 1, doctorId: 1 });

export const PatientMessage = mongoose.model<IPatientMessage>("PatientMessage", patientMessageSchema);
export const Conversation = mongoose.model<IConversation>("Conversation", conversationSchema);
