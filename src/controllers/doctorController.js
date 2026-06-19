"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDoctor = exports.updateDoctor = exports.createDoctor = exports.getDoctorById = exports.getDoctors = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Appointment_1 = require("../models/Appointment");
const Doctor_1 = require("../models/Doctor");
const User_1 = require("../models/User");
// Get all doctors with pagination and filters
const getDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 10, search, department, specialization, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        let query = {};
        if (search)
            query.name = { $regex: search, $options: "i" };
        if (department)
            query.department = department;
        if (specialization)
            query.specialization = { $regex: specialization, $options: "i" };
        if (status)
            query.status = status;
        const doctors = yield Doctor_1.Doctor.find(query)
            .populate("userId", "email")
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 });
        const total = yield Doctor_1.Doctor.countDocuments(query);
        return res.json({ doctors, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching doctors", error });
    }
});
exports.getDoctors = getDoctors;
const getDoctorById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctor = yield Doctor_1.Doctor.findById(req.params.id);
        if (!doctor)
            return res.status(404).json({ message: "Doctor not found" });
        return res.json(doctor);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch doctor", error });
    }
});
exports.getDoctorById = getDoctorById;
const createDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, gender, dob, qualification, specialization, experience, department, licenseNumber, address, consultationFee, password, profileImage, description, } = req.body;
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const existingUser = yield User_1.User.findOne({ email });
        if (existingUser)
            return res.status(409).json({ message: "Email already in use" });
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield User_1.User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: "doctor",
            gender,
            dob,
            status: "active",
        });
        const doctor = yield Doctor_1.Doctor.create({
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
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to create doctor", error });
    }
});
exports.createDoctor = createDoctor;
const updateDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctorId = req.params.id;
        const { name, email, password, specialization, experience, availableDays, consultationFee, profileImage, description, } = req.body;
        const doctor = yield Doctor_1.Doctor.findById(doctorId);
        if (!doctor)
            return res.status(404).json({ message: "Doctor not found" });
        if (email) {
            const existing = yield User_1.User.findOne({ email, _id: { $ne: doctor.userId } });
            if (existing)
                return res.status(409).json({ message: "Email already in use" });
            yield User_1.User.findByIdAndUpdate(doctor.userId, { email }, { new: true });
        }
        if (name) {
            yield User_1.User.findByIdAndUpdate(doctor.userId, { name }, { new: true });
        }
        if (password) {
            const hashed = yield bcryptjs_1.default.hash(password, 10);
            yield User_1.User.findByIdAndUpdate(doctor.userId, { password: hashed }, { new: true });
        }
        if (specialization)
            doctor.specialization = specialization;
        if (experience != null)
            doctor.experience = experience;
        if (Array.isArray(availableDays))
            doctor.availableDays = availableDays;
        if (consultationFee != null)
            doctor.consultationFee = consultationFee;
        if (profileImage !== undefined)
            doctor.profileImage = profileImage;
        if (description !== undefined)
            doctor.description = description;
        if (name)
            doctor.name = name;
        yield doctor.save();
        return res.json(doctor);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to update doctor", error });
    }
});
exports.updateDoctor = updateDoctor;
const deleteDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctorId = req.params.id;
        const doctor = yield Doctor_1.Doctor.findById(doctorId);
        if (!doctor)
            return res.status(404).json({ message: "Doctor not found" });
        // Best-effort cleanup: appointments refer to this doctor profile.
        // (If you later add foreign-key-like enforcement, keep this in sync.)
        yield Appointment_1.Appointment.deleteMany({ doctorId: doctor._id });
        yield Doctor_1.Doctor.findByIdAndDelete(doctorId);
        yield User_1.User.findByIdAndDelete(doctor.userId);
        return res.json({ message: "Doctor deleted" });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to delete doctor", error });
    }
});
exports.deleteDoctor = deleteDoctor;
