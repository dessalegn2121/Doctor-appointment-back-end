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
exports.getDepartmentStats = exports.getDoctorPerformance = exports.getAppointmentStats = exports.getRecentActivities = exports.getMonthlyStats = exports.getDashboardStats = void 0;
const User_1 = require("../models/User");
const Doctor_1 = require("../models/Doctor");
const Appointment_1 = require("../models/Appointment");
const Department_1 = require("../models/Department");
const AuditLog_1 = require("../models/AuditLog");
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalDoctors = yield Doctor_1.Doctor.countDocuments({ status: "active" });
        const totalPatients = yield User_1.User.countDocuments({ role: "patient" });
        const totalAppointments = yield Appointment_1.Appointment.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayAppointments = yield Appointment_1.Appointment.countDocuments({
            appointmentDate: { $gte: today, $lt: tomorrow },
        });
        const pendingAppointments = yield Appointment_1.Appointment.countDocuments({ status: "pending" });
        const approvedAppointments = yield Appointment_1.Appointment.countDocuments({ status: "approved" });
        const cancelledAppointments = yield Appointment_1.Appointment.countDocuments({ status: "cancelled" });
        const completedAppointments = yield Appointment_1.Appointment.countDocuments({ status: "completed" });
        return res.json({
            totalDoctors,
            totalPatients,
            totalAppointments,
            todayAppointments,
            pendingAppointments,
            approvedAppointments,
            cancelledAppointments,
            completedAppointments,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching dashboard stats", error });
    }
});
exports.getDashboardStats = getDashboardStats;
const getMonthlyStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const last12Months = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            last12Months.push({
                month: date.toLocaleString("default", { month: "short", year: "2-digit" }),
                date,
            });
        }
        const stats = yield Promise.all(last12Months.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const startDate = new Date(item.date.getFullYear(), item.date.getMonth(), 1);
            const endDate = new Date(item.date.getFullYear(), item.date.getMonth() + 1, 1);
            const count = yield Appointment_1.Appointment.countDocuments({
                appointmentDate: { $gte: startDate, $lt: endDate },
            });
            return { month: item.month, appointments: count };
        })));
        return res.json(stats);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching monthly stats", error });
    }
});
exports.getMonthlyStats = getMonthlyStats;
const getRecentActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activities = yield AuditLog_1.AuditLog.find().sort({ timestamp: -1 }).limit(10).populate("userId", "name email");
        return res.json(activities);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching activities", error });
    }
});
exports.getRecentActivities = getRecentActivities;
const getAppointmentStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = {
            pending: yield Appointment_1.Appointment.countDocuments({ status: "pending" }),
            approved: yield Appointment_1.Appointment.countDocuments({ status: "approved" }),
            completed: yield Appointment_1.Appointment.countDocuments({ status: "completed" }),
            cancelled: yield Appointment_1.Appointment.countDocuments({ status: "cancelled" }),
            rejected: yield Appointment_1.Appointment.countDocuments({ status: "rejected" }),
        };
        return res.json(stats);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching appointment stats", error });
    }
});
exports.getAppointmentStats = getAppointmentStats;
const getDoctorPerformance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctors = yield Doctor_1.Doctor.find({ status: "active" })
            .select("name specialization totalAppointments completedAppointments rating")
            .sort({ totalAppointments: -1 })
            .limit(10);
        return res.json(doctors);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching doctor performance", error });
    }
});
exports.getDoctorPerformance = getDoctorPerformance;
const getDepartmentStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departments = yield Department_1.Department.find({ status: "active" });
        const stats = yield Promise.all(departments.map((dept) => __awaiter(void 0, void 0, void 0, function* () {
            const doctors = yield Doctor_1.Doctor.countDocuments({ department: dept.name });
            const appointments = yield Appointment_1.Appointment.countDocuments({ departmentId: dept._id });
            return {
                name: dept.name,
                doctors,
                appointments,
            };
        })));
        return res.json(stats);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching department stats", error });
    }
});
exports.getDepartmentStats = getDepartmentStats;
