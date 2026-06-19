import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDoctor extends Document {
  userId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  dob: Date;
  qualification: string;
  specialization: string;
  experience: number;
  department: string;
  licenseNumber: string;
  address: string;
  description?: string;
  profileImage?: string;
  status: "active" | "inactive";
  consultationFee: number;
  availableDays: string[];
  rating?: number;
  totalAppointments?: number;
  completedAppointments?: number;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    dob: { type: Date, required: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    department: { type: String, default: "" },
    licenseNumber: { type: String, unique: true, sparse: true },
    address: { type: String },
    description: { type: String, default: "" },
    profileImage: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    consultationFee: { type: Number, required: true },
    availableDays: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalAppointments: { type: Number, default: 0 },
    completedAppointments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model<IDoctor>("Doctor", doctorSchema);

