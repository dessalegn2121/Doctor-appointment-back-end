import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "patient" | "doctor" | "admin" | "receptionist" | "nurse";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  gender?: "male" | "female" | "other";
  dob?: Date;
  bloodGroup?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  medicalNotes?: string;
  profileImage?: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["patient", "doctor", "admin", "receptionist", "nurse"], default: "patient" },
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: { type: Date },
    bloodGroup: { type: String },
    address: { type: String },
    emergencyContactName: { type: String },
    emergencyContactNumber: { type: String },
    medicalNotes: { type: String },
    profileImage: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);

