import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  medicines: IMedicine[];
  diagnosis: string;
  notes?: string;
  status: "active" | "inactive" | "completed";
  issueDate: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: String,
      },
    ],
    diagnosis: { type: String, required: true },
    notes: String,
    status: { type: String, enum: ["active", "inactive", "completed"], default: "active" },
    issueDate: { type: Date, default: Date.now },
    expiryDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model<IPrescription>("Prescription", prescriptionSchema);
