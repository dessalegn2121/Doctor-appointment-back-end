import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMedicalRecord extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  diagnosis: string;
  treatment: string;
  medications: string[];
  notes: string;
  recordDate: Date;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const medicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    diagnosis: { type: String, required: true },
    treatment: { type: String, required: true },
    medications: [{ type: String }],
    notes: { type: String },
    recordDate: { type: Date, default: Date.now },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patientId: 1, recordDate: -1 });

export const MedicalRecord = mongoose.model<IMedicalRecord>("MedicalRecord", medicalRecordSchema);
