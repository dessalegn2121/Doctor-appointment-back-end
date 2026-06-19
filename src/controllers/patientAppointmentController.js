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
exports.getAppointmentDetails = exports.cancelAppointment = exports.getPatientAppointments = exports.bookAppointment = void 0;
const Appointment_1 = require("../models/Appointment");
const Doctor_1 = require("../models/Doctor");
const Department_1 = require("../models/Department");
const bookAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { doctorId, departmentId, appointmentDate, timeSlot, reason } = req.body;
        if (!doctorId || !departmentId || !appointmentDate || !timeSlot || !reason) {
            return res.status(400).json({
                message: "Doctor ID, department ID, appointment date, time slot, and reason are required",
            });
        }
        // Check if doctor exists
        const doctor = yield Doctor_1.Doctor.findById(doctorId);
        if (!doctor)
            return res.status(404).json({ message: "Doctor not found" });
        const department = yield Department_1.Department.findById(departmentId);
        if (!department)
            return res.status(404).json({ message: "Department not found" });
        if ((doctor.department || "").trim().toLowerCase() !== department.name.trim().toLowerCase()) {
            return res.status(400).json({ message: "Selected doctor does not belong to this department" });
        }
        // Check if appointment slot is available
        const existingAppointment = yield Appointment_1.Appointment.findOne({
            doctorId,
            appointmentDate: new Date(appointmentDate),
            timeSlot,
            status: { $ne: "cancelled" },
        });
        if (existingAppointment) {
            return res.status(409).json({ message: "This time slot is already booked" });
        }
        const appointment = yield Appointment_1.Appointment.create({
            patientId: req.user.id,
            doctorId,
            departmentId,
            appointmentDate: new Date(appointmentDate),
            timeSlot,
            reason,
            status: "pending",
        });
        const populatedAppointment = yield appointment.populate("doctorId", "name specialization");
        return res.status(201).json(populatedAppointment);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.bookAppointment = bookAppointment;
const getPatientAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { status } = req.query;
        let filter = { patientId: req.user.id };
        if (status)
            filter.status = status;
        const appointments = yield Appointment_1.Appointment.find(filter)
            .populate("doctorId", "name specialization profileImage")
            .populate("departmentId", "name")
            .sort({ appointmentDate: -1 });
        return res.json(appointments);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getPatientAppointments = getPatientAppointments;
const cancelAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { appointmentId } = req.params;
        const appointment = yield Appointment_1.Appointment.findById(appointmentId);
        if (!appointment)
            return res.status(404).json({ message: "Appointment not found" });
        if (appointment.patientId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        if (appointment.status === "completed" || appointment.status === "cancelled") {
            return res.status(400).json({ message: "Cannot cancel this appointment" });
        }
        appointment.status = "cancelled";
        yield appointment.save();
        return res.json({ message: "Appointment cancelled successfully", appointment });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.cancelAppointment = cancelAppointment;
const getAppointmentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { appointmentId } = req.params;
        const appointment = yield Appointment_1.Appointment.findById(appointmentId)
            .populate("doctorId", "name specialization phone email profileImage")
            .populate("departmentId", "name");
        if (!appointment)
            return res.status(404).json({ message: "Appointment not found" });
        if (appointment.patientId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        return res.json(appointment);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAppointmentDetails = getAppointmentDetails;
