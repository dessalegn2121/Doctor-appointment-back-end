import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  hospitalName: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  timeZone: string;
  openingHours: string;
  closingHours: string;
  logo?: string;
  settings: Record<string, any>;
}

const settingsSchema = new Schema<ISettings>(
  {
    hospitalName: { type: String, required: true, default: "Doctor Appointment System" },
    address: { type: String },
    email: { type: String },
    phone: { type: String },
    website: { type: String },
    timeZone: { type: String, default: "UTC" },
    openingHours: { type: String, default: "09:00" },
    closingHours: { type: String, default: "18:00" },
    logo: { type: String },
    settings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);
