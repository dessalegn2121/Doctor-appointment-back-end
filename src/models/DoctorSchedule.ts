import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface IDoctorSchedule extends Document {
  doctorId: Types.ObjectId;
  day: string;
  timeSlots: ITimeSlot[];
  isWorkingDay: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const timeSlotSchema = new Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
});

const doctorScheduleSchema = new Schema<IDoctorSchedule>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    day: { type: String, required: true },
    timeSlots: [timeSlotSchema],
    isWorkingDay: { type: Boolean, default: true },
    notes: String,
  },
  { timestamps: true }
);

doctorScheduleSchema.index({ doctorId: 1, day: 1 });

export default mongoose.model<IDoctorSchedule>("DoctorSchedule", doctorScheduleSchema);
