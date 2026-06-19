import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMedicalRecord extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  appointmentId: Types.ObjectId;
  diagnosis: string;
  treatment: string;
  prescription: string;
  labReports?: string[];
  notes: string;
  visitDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    diagnosis: { type: String, required: true },
    treatment: { type: String, required: true },
    prescription: { type: String },
    labReports: { type: [String] },
    notes: { type: String },
    visitDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const MedicalRecord = mongoose.model<IMedicalRecord>("MedicalRecord", medicalRecordSchema);
