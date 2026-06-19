import { Request, Response } from "express";
import DoctorSchedule from "../models/DoctorSchedule";
import UnavailableDate from "../models/UnavailableDate";
import Doctor from "../models/Doctor";

interface AuthRequest extends Request {
  user?: any;
}

export const getDoctorSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const doctor = await Doctor.findOne({ userId: user._id });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const schedule = await DoctorSchedule.find({ doctorId: doctor._id });

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateDoctorSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { day, timeSlots, isWorkingDay, notes } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    let schedule = await DoctorSchedule.findOneAndUpdate(
      { doctorId: doctor._id, day },
      {
        $set: {
          timeSlots,
          isWorkingDay,
          notes,
        },
      },
      { new: true, upsert: true }
    );

    res.json({ message: "Schedule updated", schedule });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const markUnavailableDate = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { date, endDate, reason, type } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const unavailable = new UnavailableDate({
      doctorId: doctor._id,
      date,
      endDate,
      reason,
      type,
    });

    await unavailable.save();

    res.status(201).json({ message: "Date marked unavailable", unavailable });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getUnavailableDates = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const doctor = await Doctor.findOne({ userId: user._id });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const unavailableDates = await UnavailableDate.find({ doctorId: doctor._id }).sort({
      date: -1,
    });

    res.json(unavailableDates);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteUnavailableDate = async (req: AuthRequest, res: Response) => {
  try {
    const { dateId } = req.params;
    const { user } = req;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    await UnavailableDate.findByIdAndDelete(dateId);

    res.json({ message: "Date removed from unavailable" });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
