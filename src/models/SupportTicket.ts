import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISupportTicket extends Document {
  ticketNumber: string;
  patientId: Types.ObjectId;
  title: string;
  description: string;
  category: "complaint" | "inquiry" | "feedback" | "technical";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: Types.ObjectId;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, unique: true, required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ["complaint", "inquiry", "feedback", "technical"], default: "inquiry" },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    resolution: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.model<ISupportTicket>("SupportTicket", supportTicketSchema);
