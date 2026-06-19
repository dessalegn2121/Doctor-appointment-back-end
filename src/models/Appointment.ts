import mongoose, { Document, Schema, Types } from "mongoose";

export type AppointmentStatus = "pending" | "approved" | "confirmed" | "completed" | "cancelled" | "rejected";

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  departmentId?: Types.ObjectId;
  appointmentDate: Date;
  timeSlot: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "confirmed", "completed", "cancelled", "rejected"],
      default: "pending",
    },
    notes: { type: String },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for faster queries
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ doctorId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: -1 });

export const Appointment = mongoose.model<IAppointment>("Appointment", appointmentSchema);

