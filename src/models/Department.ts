import mongoose, { Document, Schema, Types } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  description: string;
  headDoctorId?: Types.ObjectId;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    headDoctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>("Department", departmentSchema);
