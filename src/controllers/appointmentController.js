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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDoctorPatients = exports.updateAppointment = exports.deleteAppointment = exports.getAppointments = exports.createAppointment = void 0;
const Appointment_1 = require("../models/Appointment");
const Doctor_1 = require("../models/Doctor");
const User_1 = require("../models/User");
const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { doctorId, appointmentDate } = req.body;
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        if (req.user.role !== "patient")
            return res.status(403).json({ message: "Patient access required" });
        if (!doctorId || !appointmentDate)
            return res.status(400).json({ message: "doctorId and appointmentDate are required" });
        const appt = yield Appointment_1.Appointment.create({
            patientId: req.user.id,
            doctorId,
            appointmentDate: new Date(appointmentDate),
            status: "pending",
        });
        return res.status(201).json(appt);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to create appointment", error });
    }
});
exports.createAppointment = createAppointment;
const getAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        let filter = {};
        if (req.user.role === "patient") {
            filter = { patientId: req.user.id };
        }
        else if (req.user.role === "doctor") {
            const doctor = yield Doctor_1.Doctor.findOne({ userId: req.user.id });
            if (!doctor)
                return res.status(404).json({ message: "Doctor profile not found" });
            filter = { doctorId: doctor._id };
        }
        const appointments = yield Appointment_1.Appointment.find(filter)
            .populate("doctorId", "name specialization hospital profileImage consultationFee")
            .populate("patientId", "name email")
            .sort({ createdAt: -1 });
        return res.json(appointments);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch appointments", error });
    }
});
exports.getAppointments = getAppointments;
const deleteAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const appt = yield Appointment_1.Appointment.findById(req.params.id);
        if (!appt)
            return res.status(404).json({ message: "Appointment not found" });
        if (req.user.role === "patient" && appt.patientId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not allowed" });
        }
        if (req.user.role === "doctor") {
            return res.status(403).json({ message: "Doctor cannot delete appointments" });
        }
        yield Appointment_1.Appointment.findByIdAndDelete(req.params.id);
        return res.json({ message: "Appointment deleted" });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to delete appointment", error });
    }
});
exports.deleteAppointment = deleteAppointment;
const updateAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        if (req.user.role !== "admin" && req.user.role !== "doctor") {
            return res.status(403).json({ message: "Not allowed" });
        }
        const appt = yield Appointment_1.Appointment.findById(req.params.id);
        if (!appt)
            return res.status(404).json({ message: "Appointment not found" });
        if (req.user.role === "doctor") {
            const doctor = yield Doctor_1.Doctor.findOne({ userId: req.user.id });
            if (!doctor)
                return res.status(404).json({ message: "Doctor profile not found" });
            if (appt.doctorId.toString() !== doctor._id.toString()) {
                return res.status(403).json({ message: "Not allowed" });
            }
        }
        const { status, appointmentDate } = req.body;
        if (status)
            appt.status = status;
        if (req.user.role === "admin" && appointmentDate)
            appt.appointmentDate = new Date(appointmentDate);
        yield appt.save();
        return res.json(appt);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to update appointment", error });
    }
});
exports.updateAppointment = updateAppointment;
const getDoctorPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        if (req.user.role === "admin") {
            const patients = yield User_1.User.find({ role: "patient" }).select("name email createdAt").sort({
                createdAt: -1,
            });
            return res.json(patients);
        }
        if (req.user.role !== "doctor") {
            return res.status(403).json({ message: "Doctor access required" });
        }
        const doctor = yield Doctor_1.Doctor.findOne({ userId: req.user.id });
        if (!doctor)
            return res.status(404).json({ message: "Doctor profile not found" });
        const appts = yield Appointment_1.Appointment.find({ doctorId: doctor._id }).select("patientId");
        const patientIds = Array.from(new Set(appts.map((a) => a.patientId.toString())));
        const patients = patientIds.length === 0
            ? []
            : yield User_1.User.find({ _id: { $in: patientIds } }).select("name email createdAt").sort({ createdAt: -1 });
        return res.json(patients);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch patients", error });
    }
});
exports.getDoctorPatients = getDoctorPatients;
