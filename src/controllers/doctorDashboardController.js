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
exports.updateSettings = exports.getSettings = exports.changeDoctorPassword = exports.uploadProfilePicture = exports.generateConsultationReport = exports.updateSchedule = exports.getSchedule = exports.updateLabReportStatus = exports.getLabReports = exports.markNotificationAsRead = exports.getNotifications = exports.getDoctorReviews = exports.sendMessage = exports.getDoctorMessages = exports.createPrescription = exports.createMedicalRecord = exports.getPatientDetails = exports.getDoctorPatients = exports.updateAppointmentStatus = exports.getDoctorAppointments = exports.updateDoctorProfile = exports.getDoctorProfile = exports.getDoctorPrescriptions = exports.getChartData = exports.getDoctorDashboardOverview = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Doctor_1 = require("../models/Doctor");
const User_1 = require("../models/User");
const Appointment_1 = require("../models/Appointment");
const MedicalRecord_1 = require("../models/MedicalRecord");
const DoctorNotification_1 = __importDefault(require("../models/DoctorNotification"));
const Prescription_1 = __importDefault(require("../models/Prescription"));
const Review_1 = __importDefault(require("../models/Review"));
const Message_1 = __importDefault(require("../models/Message"));
const LabReport_1 = __importDefault(require("../models/LabReport"));
const DoctorSchedule_1 = __importDefault(require("../models/DoctorSchedule"));
const mongoose_1 = require("mongoose");
const getDoctorDashboardOverview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        if (user.role !== "doctor") {
            return res.status(403).json({ error: "Access denied" });
        }
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Get statistics
        const totalPatients = yield Appointment_1.Appointment.distinct("patientId", { doctorId: doctor._id });
        const todayAppointments = yield Appointment_1.Appointment.countDocuments({
            doctorId: doctor._id,
            appointmentDate: { $gte: today, $lt: tomorrow },
        });
        const upcomingAppointments = yield Appointment_1.Appointment.countDocuments({
            doctorId: doctor._id,
            appointmentDate: { $gte: tomorrow },
            status: { $nin: ["completed", "cancelled", "rejected"] },
        });
        const completedAppointments = yield Appointment_1.Appointment.countDocuments({
            doctorId: doctor._id,
            status: "completed",
        });
        const pendingAppointments = yield Appointment_1.Appointment.countDocuments({
            doctorId: doctor._id,
            status: "pending",
        });
        const unreadMessages = yield Message_1.default.countDocuments({
            receiverId: user._id,
            isRead: false,
        });
        const totalPrescriptions = yield Prescription_1.default.countDocuments({
            doctorId: doctor._id,
        });
        const unreadNotifications = yield DoctorNotification_1.default.countDocuments({
            doctorId: doctor._id,
            isRead: false,
        });
        // Recent notifications
        const recentNotifications = yield DoctorNotification_1.default.find({
            doctorId: doctor._id
        })
            .sort({ createdAt: -1 })
            .limit(5);
        // Recent appointments
        const recentAppointments = yield Appointment_1.Appointment.find({ doctorId: doctor._id })
            .populate("patientId", "name email")
            .sort({ appointmentDate: -1 })
            .limit(5);
        res.json({
            totalPatients: totalPatients.length,
            todayAppointments,
            upcomingAppointments,
            completedAppointments,
            pendingAppointments,
            totalPrescriptions,
            unreadMessages,
            unreadNotifications,
            recentNotifications,
            recentAppointments,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDoctorDashboardOverview = getDoctorDashboardOverview;
const getChartData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { chartType = "weekly" } = req.query;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        if (chartType === "weekly") {
            // Weekly appointment statistics
            const weekData = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                const nextDate = new Date(date);
                nextDate.setDate(nextDate.getDate() + 1);
                const count = yield Appointment_1.Appointment.countDocuments({
                    doctorId: doctor._id,
                    appointmentDate: { $gte: date, $lt: nextDate },
                });
                weekData.push({
                    day: date.toLocaleDateString("en-US", { weekday: "short" }),
                    appointments: count,
                });
            }
            return res.json(weekData);
        }
        else if (chartType === "monthly") {
            // Monthly patient statistics
            const monthData = [];
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthName = date.toLocaleDateString("en-US", { month: "short" });
                const count = yield Appointment_1.Appointment.countDocuments({
                    doctorId: doctor._id,
                    appointmentDate: {
                        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
                    },
                    status: "completed",
                });
                monthData.push({
                    month: monthName,
                    completed: count,
                });
            }
            return res.json(monthData);
        }
        else if (chartType === "consultation") {
            // Consultation trends
            const trendData = yield Appointment_1.Appointment.aggregate([
                { $match: { doctorId: new mongoose_1.Types.ObjectId(doctor._id) } },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]);
            return res.json(trendData);
        }
        return res.json([]);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getChartData = getChartData;
const getDoctorPrescriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { page = 1, limit = 10 } = req.query;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const prescriptions = yield Prescription_1.default.find({ doctorId: doctor._id })
            .populate("patientId", "name email phone gender bloodGroup")
            .populate("appointmentId", "appointmentDate timeSlot status")
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield Prescription_1.default.countDocuments({ doctorId: doctor._id });
        return res.json({ prescriptions, total, page: Number(page), limit: Number(limit) });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getDoctorPrescriptions = getDoctorPrescriptions;
const getDoctorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id }).lean();
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const userDetails = yield User_1.User.findById(user._id).select("-password").lean();
        res.json(Object.assign(Object.assign({}, doctor), { user: userDetails }));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDoctorProfile = getDoctorProfile;
const updateDoctorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { name, phone, gender, dob, qualification, specialization, experience, licenseNumber, address, description, consultationFee, } = req.body;
        const doctor = yield Doctor_1.Doctor.findOneAndUpdate({ userId: user._id }, {
            $set: {
                name,
                phone,
                gender,
                dob,
                qualification,
                specialization,
                experience,
                licenseNumber,
                address,
                description,
                consultationFee,
            },
        }, { new: true });
        // Update user details
        yield User_1.User.findByIdAndUpdate(user._id, { name, phone, gender, dob, address });
        res.json({ message: "Profile updated successfully", doctor });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateDoctorProfile = updateDoctorProfile;
const getDoctorAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { status, page = 1, limit = 10 } = req.query;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const query = { doctorId: doctor._id };
        if (status)
            query.status = status;
        const appointments = yield Appointment_1.Appointment.find(query)
            .populate("patientId", "name email phone")
            .populate("departmentId", "name")
            .sort({ appointmentDate: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield Appointment_1.Appointment.countDocuments(query);
        res.json({ appointments, total, page, limit });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDoctorAppointments = getDoctorAppointments;
const updateAppointmentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appointmentId } = req.params;
        const { status, notes } = req.body;
        const { user } = req;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const appointment = yield Appointment_1.Appointment.findOneAndUpdate({ _id: appointmentId, doctorId: doctor._id }, { status, notes, updatedAt: new Date() }, { new: true }).populate("patientId");
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found" });
        }
        // Create notification
        if (appointment.patientId) {
            const patientUser = appointment.patientId;
            yield DoctorNotification_1.default.create({
                doctorId: doctor._id,
                title: "Appointment Status Updated",
                message: `Your appointment status has been updated to ${status}`,
                type: "appointment",
                relatedId: appointmentId,
            });
        }
        res.json({ message: "Appointment updated successfully", appointment });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateAppointmentStatus = updateAppointmentStatus;
const getDoctorPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { page = 1, limit = 10, search = "" } = req.query;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const query = { doctorId: doctor._id };
        const appointments = yield Appointment_1.Appointment.find(query).select("patientId");
        const patientIds = [...new Set(appointments.map((a) => a.patientId.toString()))];
        let userQuery = { _id: { $in: patientIds }, role: "patient" };
        if (search) {
            userQuery.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }
        const patients = yield User_1.User.find(userQuery)
            .select("-password")
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield User_1.User.countDocuments(userQuery);
        res.json({ patients, total, page, limit });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDoctorPatients = getDoctorPatients;
const getPatientDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId } = req.params;
        const { user } = req;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        // Verify doctor has treated this patient
        const appointment = yield Appointment_1.Appointment.findOne({
            patientId,
            doctorId: doctor._id,
        });
        if (!appointment && user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" });
        }
        const patient = yield User_1.User.findById(patientId).select("-password").lean();
        const medicalRecords = yield MedicalRecord_1.MedicalRecord.find({ patientId }).sort({ visitDate: -1 });
        const prescriptions = yield Prescription_1.default.find({ patientId, doctorId: doctor._id });
        const appointments = yield Appointment_1.Appointment.find({ patientId, doctorId: doctor._id }).sort({ appointmentDate: -1 });
        res.json({
            patient,
            medicalRecords,
            prescriptions,
            appointments,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPatientDetails = getPatientDetails;
const createMedicalRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { patientId, diagnosis, treatment, notes, visitDate } = req.body;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const medicalRecord = new MedicalRecord_1.MedicalRecord({
            doctorId: doctor._id,
            patientId,
            diagnosis,
            treatment,
            notes,
            visitDate,
        });
        yield medicalRecord.save();
        res.status(201).json({ message: "Medical record created", medicalRecord });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createMedicalRecord = createMedicalRecord;
const createPrescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { patientId, appointmentId, medicines, diagnosis, notes } = req.body;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const prescription = new Prescription_1.default({
            doctorId: doctor._id,
            patientId,
            appointmentId,
            medicines,
            diagnosis,
            notes,
        });
        yield prescription.save();
        res.status(201).json({ message: "Prescription created", prescription });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createPrescription = createPrescription;
const getDoctorMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { page = 1, limit = 10 } = req.query;
        const messages = yield Message_1.default.find({
            $or: [{ senderId: user._id }, { receiverId: user._id }],
        })
            .populate("senderId", "name email")
            .populate("receiverId", "name email")
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield Message_1.default.countDocuments({
            $or: [{ senderId: user._id }, { receiverId: user._id }],
        });
        res.json({ messages, total, page, limit });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDoctorMessages = getDoctorMessages;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { receiverId, message, appointmentId } = req.body;
        const newMessage = new Message_1.default({
            senderId: user._id,
            senderRole: user.role,
            receiverId,
            message,
            appointmentId,
        });
        yield newMessage.save();
        res.status(201).json({ message: "Message sent", data: newMessage });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.sendMessage = sendMessage;
const getDoctorReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { user } = req;
        const { page = 1, limit = 10 } = req.query;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const reviews = yield Review_1.default.find({ doctorId: doctor._id, status: "approved" })
            .populate("patientId", "name")
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const totalReviews = yield Review_1.default.countDocuments({ doctorId: doctor._id, status: "approved" });
        const avgRating = yield Review_1.default.aggregate([
            { $match: { doctorId: doctor._id, status: "approved" } },
            { $group: { _id: null, avgRating: { $avg: "$rating" } } },
        ]);
        res.json({
            reviews,
            totalReviews,
            avgRating: ((_a = avgRating[0]) === null || _a === void 0 ? void 0 : _a.avgRating) || 0,
            page,
            limit,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDoctorReviews = getDoctorReviews;
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { page = 1, limit = 10, isRead } = req.query;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const query = { doctorId: doctor._id };
        if (isRead !== undefined) {
            query.isRead = isRead === "true";
        }
        const notifications = yield DoctorNotification_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield DoctorNotification_1.default.countDocuments(query);
        res.json({ notifications, total, page, limit });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getNotifications = getNotifications;
const markNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { notificationId } = req.params;
        const notification = yield DoctorNotification_1.default.findByIdAndUpdate(notificationId, { isRead: true, readAt: new Date() }, { new: true });
        res.json({ message: "Notification marked as read", notification });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
// ============== LAB REPORTS ==============
const getLabReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { page = 1, limit = 10, status } = req.query;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const skip = (Number(page) - 1) * Number(limit);
        let query = { doctorId: doctor._id };
        if (status)
            query.status = status;
        const reports = yield LabReport_1.default.find(query)
            .populate("patientId", "name email")
            .skip(skip)
            .limit(Number(limit))
            .sort({ reportDate: -1 });
        const total = yield LabReport_1.default.countDocuments(query);
        return res.json({
            reports,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getLabReports = getLabReports;
const updateLabReportStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reportId } = req.params;
        const { status, doctorNotes } = req.body;
        const report = yield LabReport_1.default.findByIdAndUpdate(reportId, {
            status,
            doctorNotes,
            reviewedAt: status === "reviewed" ? new Date() : undefined,
        }, { new: true });
        return res.json({ message: "Lab report updated", report });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.updateLabReportStatus = updateLabReportStatus;
// ============== SCHEDULE MANAGEMENT ==============
const getSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const schedule = yield DoctorSchedule_1.default.find({ doctorId: doctor._id }).sort({ day: 1 });
        return res.json(schedule);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getSchedule = getSchedule;
const updateSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { day, timeSlots, isWorkingDay, notes } = req.body;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const schedule = yield DoctorSchedule_1.default.findOneAndUpdate({ doctorId: doctor._id, day }, { timeSlots, isWorkingDay, notes }, { new: true, upsert: true });
        return res.json({ message: "Schedule updated", schedule });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.updateSchedule = updateSchedule;
// ============== GENERATE REPORTS ==============
const generateConsultationReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { reportType = "daily", dateFrom, dateTo } = req.body;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        let dateRange = {};
        if (reportType === "daily") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateRange = { $gte: today, $lt: tomorrow };
        }
        else if (reportType === "weekly") {
            const today = new Date();
            const firstDay = new Date(today);
            firstDay.setDate(today.getDate() - today.getDay());
            firstDay.setHours(0, 0, 0, 0);
            dateRange = { $gte: firstDay };
        }
        else if (reportType === "monthly") {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            dateRange = { $gte: firstDay };
        }
        if (dateFrom && dateTo) {
            dateRange = {
                $gte: new Date(dateFrom),
                $lte: new Date(dateTo),
            };
        }
        const appointments = yield Appointment_1.Appointment.find({
            doctorId: doctor._id,
            appointmentDate: dateRange,
        }).populate("patientId");
        const statistics = {
            totalAppointments: appointments.length,
            completed: appointments.filter((a) => a.status === "completed").length,
            pending: appointments.filter((a) => a.status === "pending").length,
            cancelled: appointments.filter((a) => a.status === "cancelled").length,
            rejected: appointments.filter((a) => a.status === "rejected").length,
            totalPatients: new Set(appointments.map((a) => a.patientId._id.toString())).size,
        };
        return res.json({
            reportType,
            statistics,
            appointments,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.generateConsultationReport = generateConsultationReport;
// ============== PROFILE PICTURE UPLOAD ==============
const uploadProfilePicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { profileImage } = req.body; // Base64 or URL
        const doctor = yield Doctor_1.Doctor.findOneAndUpdate({ userId: user._id }, { profileImage }, { new: true });
        return res.json({ message: "Profile picture updated", doctor });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.uploadProfilePicture = uploadProfilePicture;
const changeDoctorPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { currentPassword, newPassword } = req.body;
        const dbUser = yield User_1.User.findById(user._id);
        if (!dbUser)
            return res.status(404).json({ error: "User not found" });
        const isPasswordValid = yield bcryptjs_1.default.compare(currentPassword, dbUser.password);
        if (!isPasswordValid)
            return res.status(401).json({ error: "Current password is incorrect" });
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        dbUser.password = hashedPassword;
        yield dbUser.save();
        return res.json({ message: "Password changed successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.changeDoctorPassword = changeDoctorPassword;
// ============== SETTINGS ==============
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        // Return notification preferences and privacy settings
        return res.json({
            notificationPreferences: {
                emailNotifications: true,
                appointmentReminders: true,
                newPatientAlerts: true,
            },
            privacySettings: {
                showProfile: true,
                allowMessages: true,
                shareReviews: true,
            },
            securitySettings: {
                twoFactorAuth: false,
                loginAlerts: true,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.getSettings = getSettings;
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { notificationPreferences, privacySettings, securitySettings } = req.body;
        // Store settings (ideally in a separate collection)
        // For now, returning success
        return res.json({
            message: "Settings updated successfully",
            settings: {
                notificationPreferences,
                privacySettings,
                securitySettings,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
exports.updateSettings = updateSettings;
