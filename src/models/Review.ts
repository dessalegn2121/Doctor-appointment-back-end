import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
  doctorId: Types.ObjectId;
  patientId: Types.ObjectId;
  appointmentId?: Types.ObjectId;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

reviewSchema.index({ doctorId: 1 });

export default mongoose.model<IReview>("Review", reviewSchema);
