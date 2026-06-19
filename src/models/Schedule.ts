import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISchedule extends Document {
  doctorId: Types.ObjectId;
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  startTime: string;
  endTime: string;
  slotDuration: number;
  isAvailable: boolean;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    day: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      required: true,
    },
    startTime: { type: String, required: true }, // HH:MM format
    endTime: { type: String, required: true }, // HH:MM format
    slotDuration: { type: Number, default: 30 }, // in minutes
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate schedules
scheduleSchema.index({ doctorId: 1, day: 1 }, { unique: true });

export const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);
