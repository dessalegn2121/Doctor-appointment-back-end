import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Doctor } from "../models/Doctor";
import { AuthRole } from "../middleware/authMiddleware";

const signToken = (payload: { id: string; role: AuthRole }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, gender, dob, role, qualification, specialization, experience, licenseNumber } = req.body as {
      name: string;
      email: string;
      password: string;
      phone: string;
      gender?: string;
      dob?: string;
      role?: string;
      qualification?: string;
      specialization?: string;
      experience?: number | string;
      licenseNumber?: string;
    };

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "name, email, password, and phone are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const userRole = role && ["admin", "doctor", "patient"].includes(role) ? role : "patient";
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      gender: gender || "other",
      dob: dob ? new Date(dob) : undefined,
      role: userRole,
    });

    // If registering as doctor, create a Doctor record
    if (userRole === "doctor") {
      await Doctor.create({
        userId: user._id,
        name,
        email,
        phone,
        gender: gender || "other",
        dob: dob ? new Date(dob) : new Date(),
        qualification: qualification || "MD",
        specialization: specialization || "General Practice",
        experience: experience ? parseInt(experience as string) : 0,
        licenseNumber: licenseNumber || `LICENSE-${user._id}`,
        consultationFee: 100,
        status: "active",
      });
    }

    const token = signToken({ id: user._id.toString(), role: user.role });
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Registration failed", error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ id: user._id.toString(), role: user.role });
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error });
  }
};

