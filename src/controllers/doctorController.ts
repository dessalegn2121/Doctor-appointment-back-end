import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Appointment } from "../models/Appointment";
import { Doctor } from "../models/Doctor";
import { User } from "../models/User";

// Get all doctors with pagination and filters
export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search, department, specialization, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query: any = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (department) query.department = department;
    if (specialization) query.specialization = { $regex: specialization, $options: "i" };
    if (status) query.status = status;

    const doctors = await Doctor.find(query)
      .populate("userId", "email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Doctor.countDocuments(query);

    return res.json({ doctors, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching doctors", error });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch doctor", error });
  }
};

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      dob,
      qualification,
      specialization,
      experience,
      department,
      licenseNumber,
      address,
      consultationFee,
      password,
      profileImage,
      description,
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "doctor",
      gender,
      dob,
      status: "active",
    });

    const doctor = await Doctor.create({
      userId: user._id,
      name,
      email,
      phone,
      gender,
      dob,
      qualification,
      specialization,
      experience,
      department,
      licenseNumber,
      address,
      consultationFee,
      profileImage,
      description,
      status: "active",
    });

    return res.status(201).json({ message: "Doctor created successfully", doctor });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create doctor", error });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.id;
    const {
      name,
      email,
      password,
      specialization,
      experience,
      availableDays,
      consultationFee,
      profileImage,
      description,
    } = req.body as Partial<{
      name: string;
      email: string;
      password: string;
      specialization: string;
      experience: number;
      hospital: string;
      availableDays: string[];
      consultationFee: number;
      profileImage: string;
      description: string;
    }>;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: doctor.userId } });
      if (existing) return res.status(409).json({ message: "Email already in use" });
      await User.findByIdAndUpdate(doctor.userId, { email }, { new: true });
    }

    if (name) {
      await User.findByIdAndUpdate(doctor.userId, { name }, { new: true });
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(doctor.userId, { password: hashed }, { new: true });
    }

    if (specialization) doctor.specialization = specialization;
    if (experience != null) doctor.experience = experience;
    if (Array.isArray(availableDays)) doctor.availableDays = availableDays;
    if (consultationFee != null) doctor.consultationFee = consultationFee;
    if (profileImage !== undefined) doctor.profileImage = profileImage;
    if (description !== undefined) doctor.description = description;
    if (name) doctor.name = name;

    await doctor.save();
    return res.json(doctor);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update doctor", error });
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.id;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Best-effort cleanup: appointments refer to this doctor profile.
    // (If you later add foreign-key-like enforcement, keep this in sync.)
    await Appointment.deleteMany({ doctorId: doctor._id });

    await Doctor.findByIdAndDelete(doctorId);
    await User.findByIdAndDelete(doctor.userId);

    return res.json({ message: "Doctor deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete doctor", error });
  }
};

