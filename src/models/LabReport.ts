import mongoose, { Document, Schema, Types } from "mongoose";

export interface ILabReport extends Document {
  doctorId?: Types.ObjectId;
  patientId: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  testName: string;
  testDescription?: string;
  results: string;
  fileUrl?: string;
  doctorNotes?: string;
  status: "pending" | "completed" | "reviewed";
  reportDate: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const labReportSchema = new Schema<ILabReport>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    testName: { type: String, required: true },
    testDescription: String,
    results: { type: String, required: true },
    fileUrl: String,
    doctorNotes: String,
    status: { type: String, enum: ["pending", "completed", "reviewed"], default: "pending" },
    reportDate: { type: Date, default: Date.now },
    reviewedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model<ILabReport>("LabReport", labReportSchema);
