import { Response } from "express";
import { Appointment } from "../models/Appointment";
import { AuthRequest } from "../middleware/authMiddleware";
import { Doctor } from "../models/Doctor";
import { User } from "../models/User";

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, appointmentDate } = req.body as {
      doctorId: string;
      appointmentDate: string;
    };

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "patient") return res.status(403).json({ message: "Patient access required" });
    if (!doctorId || !appointmentDate) return res.status(400).json({ message: "doctorId and appointmentDate are required" });

    const appt = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      status: "pending",
    });
    return res.status(201).json(appt);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create appointment", error });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    let filter: Record<string, unknown> = {};
    if (req.user.role === "patient") {
      filter = { patientId: req.user.id };
    } else if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
      filter = { doctorId: doctor._id };
    }

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name specialization hospital profileImage consultationFee")
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch appointments", error });
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (req.user.role === "patient" && appt.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (req.user.role === "doctor") {
      return res.status(403).json({ message: "Doctor cannot delete appointments" });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    return res.json({ message: "Appointment deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete appointment", error });
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (req.user.role !== "admin" && req.user.role !== "doctor") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
      if (appt.doctorId.toString() !== doctor._id.toString()) {
        return res.status(403).json({ message: "Not allowed" });
      }
    }

    const { status, appointmentDate } = req.body as {
      status?: "pending" | "confirmed" | "cancelled" | "completed";
      appointmentDate?: string;
    };

    if (status) appt.status = status;
    if (req.user.role === "admin" && appointmentDate) appt.appointmentDate = new Date(appointmentDate);

    await appt.save();
    return res.json(appt);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update appointment", error });
  }
};

export const getDoctorPatients = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (req.user.role === "admin") {
      const patients = await User.find({ role: "patient" }).select("name email createdAt").sort({
        createdAt: -1,
      });
      return res.json(patients);
    }

    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Doctor access required" });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const appts = await Appointment.find({ doctorId: doctor._id }).select("patientId");
    const patientIds = Array.from(new Set(appts.map((a) => a.patientId.toString())));

    const patients =
      patientIds.length === 0
        ? []
        : await User.find({ _id: { $in: patientIds } }).select("name email createdAt").sort({ createdAt: -1 });

    return res.json(patients);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch patients", error });
  }
};

