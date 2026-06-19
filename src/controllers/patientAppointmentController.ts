import { Response } from "express";
import { Appointment } from "../models/Appointment";
import { AuthRequest } from "../middleware/authMiddleware";
import { Doctor } from "../models/Doctor";
import { Department } from "../models/Department";

export const bookAppointment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { doctorId, departmentId, appointmentDate, timeSlot, reason } = req.body;

    if (!doctorId || !departmentId || !appointmentDate || !timeSlot || !reason) {
      return res.status(400).json({
        message: "Doctor ID, department ID, appointment date, time slot, and reason are required",
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const department = await Department.findById(departmentId);
    if (!department) return res.status(404).json({ message: "Department not found" });

    if ((doctor.department || "").trim().toLowerCase() !== department.name.trim().toLowerCase()) {
      return res.status(400).json({ message: "Selected doctor does not belong to this department" });
    }

    // Check if appointment slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(409).json({ message: "This time slot is already booked" });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      departmentId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      reason,
      status: "pending",
    });

    const populatedAppointment = await appointment.populate("doctorId", "name specialization");

    return res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPatientAppointments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { status } = req.query;

    let filter: any = { patientId: req.user.id };
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name specialization profileImage")
      .populate("departmentId", "name")
      .sort({ appointmentDate: -1 });

    return res.json(appointments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (appointment.status === "completed" || appointment.status === "cancelled") {
      return res.status(400).json({ message: "Cannot cancel this appointment" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAppointmentDetails = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId", "name specialization phone email profileImage")
      .populate("departmentId", "name");

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.json(appointment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
