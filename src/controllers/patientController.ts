import { Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Appointment } from "../models/Appointment";
import { AuthRequest } from "../middleware/authMiddleware";
import { Department } from "../models/Department";
import { Doctor } from "../models/Doctor";

export const getPatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const patient = await User.findById(req.user.id).select("-password");
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    return res.json(patient);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePatientProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { name, phone, gender, dob, address, bloodGroup } = req.body;

    const patient = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, gender, dob, address, bloodGroup },
      { new: true }
    ).select("-password");

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    return res.json(patient);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" });
    }

    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const isPasswordValid = await bcrypt.compare(currentPassword, patient.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hashed });

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPatientDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const upcomingAppointments = await Appointment.find({
      patientId: req.user.id,
      appointmentDate: { $gte: new Date() },
      status: { $ne: "cancelled" },
    })
      .populate("doctorId", "name")
      .sort({ appointmentDate: 1 })
      .limit(5);

    const completedAppointments = await Appointment.countDocuments({
      patientId: req.user.id,
      status: "completed",
    });

    const patient = await User.findById(req.user.id).select("-password");

    return res.json({
      patient,
      upcomingAppointments,
      completedAppointments,
      dashboardStats: {
        totalAppointments: upcomingAppointments.length + completedAppointments,
        upcomingCount: upcomingAppointments.length,
        completedCount: completedAppointments,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPatientDepartments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const activeDepartments = await Department.find({ status: "active" })
      .select("name description")
      .sort({ name: 1 });

    const doctorDepartmentNames = await Doctor.distinct("department", {
      department: { $exists: true, $ne: "" },
    });

    const normalizedDoctorDepartments = Array.from(
      new Set(
        doctorDepartmentNames
          .map((department) => String(department).trim())
          .filter(Boolean)
      )
    );

    if (normalizedDoctorDepartments.length > 0) {
      const existingDepartmentNames = new Set(
        activeDepartments.map((department) => department.name.trim().toLowerCase())
      );

      const missingDepartments = normalizedDoctorDepartments
        .filter((departmentName) => !existingDepartmentNames.has(departmentName.toLowerCase()))
        .map((departmentName) => ({ name: departmentName, description: "" }));

      if (missingDepartments.length > 0) {
        await Department.insertMany(missingDepartments, { ordered: false });
      }
    }

    const departments = await Department.find({ status: "active" })
      .select("name description")
      .sort({ name: 1 });

    return res.json(departments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
