import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUnavailableDate extends Document {
  doctorId: Types.ObjectId;
  date: Date;
  reason: string;
  endDate?: Date;
  type: "leave" | "holiday" | "emergency";
  createdAt: Date;
  updatedAt: Date;
}

const unavailableDateSchema = new Schema<IUnavailableDate>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    reason: { type: String, required: true },
    endDate: Date,
    type: { type: String, enum: ["leave", "holiday", "emergency"], default: "leave" },
  },
  { timestamps: true }
);

unavailableDateSchema.index({ doctorId: 1, date: 1 });

export default mongoose.model<IUnavailableDate>("UnavailableDate", unavailableDateSchema);
