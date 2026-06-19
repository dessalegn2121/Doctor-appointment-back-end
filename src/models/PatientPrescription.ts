import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPrescription extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  medicines: Array<{
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }>;
  notes: string;
  prescriptionDate: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String, required: true },
      },
    ],
    notes: { type: String },
    prescriptionDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

prescriptionSchema.index({ patientId: 1, prescriptionDate: -1 });

export const Prescription = mongoose.model<IPrescription>("Prescription", prescriptionSchema);
