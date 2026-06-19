import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { User } from "../models/User";
import { Appointment } from "../models/Appointment";
import { Department } from "../models/Department";
import { Settings } from "../models/Settings";

export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const patients = await User.find({ role: "patient" })
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    return res.json(patients);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch patients", error });
  }
};

export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const patientId = req.params.id;
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    await Appointment.deleteMany({ patientId: patient._id });
    await User.findByIdAndDelete(patient._id);

    return res.json({ message: "Patient deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete patient", error });
  }
};

// Department management
export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const departments = await Department.find().sort({ createdAt: -1 });
    return res.json(departments);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch departments", error });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Department name is required" });

    const newDepartment = new Department({ name, description });
    const savedDepartment = await newDepartment.save();

    return res.status(201).json(savedDepartment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create department", error });
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { name, description } = req.body;

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    return res.json(updatedDepartment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update department", error });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const deletedDepartment = await Department.findByIdAndDelete(id);

    if (!deletedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    return res.json({ message: "Department deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete department", error });
  }
};

// Settings management
export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({
        hospitalName: "Doctor Appointment System",
      });
      await settings.save();
    }

    return res.json({
      appName: settings.hospitalName,
      appEmail: settings.email,
      phone: settings.phone,
      address: settings.address,
      about: settings.settings?.about || "",
      workingHours: `${settings.openingHours} - ${settings.closingHours}`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch settings", error });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { appName, appEmail, phone, address, about, workingHours } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings.hospitalName = appName || settings.hospitalName;
    settings.email = appEmail || settings.email;
    settings.phone = phone || settings.phone;
    settings.address = address || settings.address;

    if (workingHours) {
      const [opening, closing] = workingHours.split(" - ");
      settings.openingHours = opening?.trim() || settings.openingHours;
      settings.closingHours = closing?.trim() || settings.closingHours;
    }

    if (about) {
      settings.settings = settings.settings || {};
      settings.settings.about = about;
    }

    const updatedSettings = await settings.save();

    return res.json({
      appName: updatedSettings.hospitalName,
      appEmail: updatedSettings.email,
      phone: updatedSettings.phone,
      address: updatedSettings.address,
      about: updatedSettings.settings?.about || "",
      workingHours: `${updatedSettings.openingHours} - ${updatedSettings.closingHours}`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update settings", error });
  }
};

