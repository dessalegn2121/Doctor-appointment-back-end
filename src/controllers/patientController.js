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
exports.getPatientDepartments = exports.getPatientDashboard = exports.changePassword = exports.updatePatientProfile = exports.getPatientProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const Appointment_1 = require("../models/Appointment");
const Department_1 = require("../models/Department");
const Doctor_1 = require("../models/Doctor");
const getPatientProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const patient = yield User_1.User.findById(req.user.id).select("-password");
        if (!patient)
            return res.status(404).json({ message: "Patient not found" });
        return res.json(patient);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getPatientProfile = getPatientProfile;
const updatePatientProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { name, phone, gender, dob, address, bloodGroup } = req.body;
        const patient = yield User_1.User.findByIdAndUpdate(req.user.id, { name, phone, gender, dob, address, bloodGroup }, { new: true }).select("-password");
        if (!patient)
            return res.status(404).json({ message: "Patient not found" });
        return res.json(patient);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updatePatientProfile = updatePatientProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new passwords are required" });
        }
        const patient = yield User_1.User.findById(req.user.id);
        if (!patient)
            return res.status(404).json({ message: "Patient not found" });
        const isPasswordValid = yield bcryptjs_1.default.compare(currentPassword, patient.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }
        const hashed = yield bcryptjs_1.default.hash(newPassword, 10);
        yield User_1.User.findByIdAndUpdate(req.user.id, { password: hashed });
        return res.json({ message: "Password changed successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.changePassword = changePassword;
const getPatientDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const upcomingAppointments = yield Appointment_1.Appointment.find({
            patientId: req.user.id,
            appointmentDate: { $gte: new Date() },
            status: { $ne: "cancelled" },
        })
            .populate("doctorId", "name")
            .sort({ appointmentDate: 1 })
            .limit(5);
        const completedAppointments = yield Appointment_1.Appointment.countDocuments({
            patientId: req.user.id,
            status: "completed",
        });
        const patient = yield User_1.User.findById(req.user.id).select("-password");
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getPatientDashboard = getPatientDashboard;
const getPatientDepartments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const activeDepartments = yield Department_1.Department.find({ status: "active" })
            .select("name description")
            .sort({ name: 1 });
        const doctorDepartmentNames = yield Doctor_1.Doctor.distinct("department", {
            department: { $exists: true, $ne: "" },
        });
        const normalizedDoctorDepartments = Array.from(new Set(doctorDepartmentNames
            .map((department) => String(department).trim())
            .filter(Boolean)));
        if (normalizedDoctorDepartments.length > 0) {
            const existingDepartmentNames = new Set(activeDepartments.map((department) => department.name.trim().toLowerCase()));
            const missingDepartments = normalizedDoctorDepartments
                .filter((departmentName) => !existingDepartmentNames.has(departmentName.toLowerCase()))
                .map((departmentName) => ({ name: departmentName, description: "" }));
            if (missingDepartments.length > 0) {
                yield Department_1.Department.insertMany(missingDepartments, { ordered: false });
            }
        }
        const departments = yield Department_1.Department.find({ status: "active" })
            .select("name description")
            .sort({ name: 1 });
        return res.json(departments);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getPatientDepartments = getPatientDepartments;
