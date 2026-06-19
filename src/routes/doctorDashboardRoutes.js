"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const doctorDashboardController_1 = require("../controllers/doctorDashboardController");
const router = (0, express_1.Router)();
// Middleware to verify doctor role
const checkDoctor = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "doctor") {
        return res.status(403).json({ error: "Access denied. Doctor role required." });
    }
    next();
};
// ============ DASHBOARD OVERVIEW ============
router.get("/overview", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getDoctorDashboardOverview);
router.get("/chart-data", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getChartData);
// ============ PROFILE ============
router.get("/profile", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getDoctorProfile);
router.put("/profile", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.updateDoctorProfile);
router.post("/profile/picture", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.uploadProfilePicture);
router.post("/password", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.changeDoctorPassword);
// ============ APPOINTMENTS ============
router.get("/appointments", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getDoctorAppointments);
router.put("/appointments/:appointmentId/status", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.updateAppointmentStatus);
// ============ PATIENTS ============
router.get("/patients", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getDoctorPatients);
router.get("/patients/:patientId", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getPatientDetails);
// ============ MEDICAL RECORDS ============
router.post("/medical-records", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.createMedicalRecord);
// ============ PRESCRIPTIONS ============
router.post("/prescriptions", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.createPrescription);
router.get("/prescriptions", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getDoctorPrescriptions);
// ============ LAB REPORTS ============
router.get("/lab-reports", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getLabReports);
router.put("/lab-reports/:reportId", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.updateLabReportStatus);
// ============ MESSAGES ============
router.get("/messages", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getDoctorMessages);
router.post("/messages", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.sendMessage);
// ============ NOTIFICATIONS ============
router.get("/notifications", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getNotifications);
router.put("/notifications/:notificationId/read", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.markNotificationAsRead);
// ============ REVIEWS ============
router.get("/reviews", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getDoctorReviews);
// ============ SCHEDULE ============
router.get("/schedule", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getSchedule);
router.put("/schedule", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.updateSchedule);
// ============ REPORTS ============
router.post("/reports/consultation", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.generateConsultationReport);
// ============ SETTINGS ============
router.get("/settings", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.getSettings);
router.put("/settings", authMiddleware_1.verifyToken, checkDoctor, doctorDashboardController_1.updateSettings);
exports.default = router;
