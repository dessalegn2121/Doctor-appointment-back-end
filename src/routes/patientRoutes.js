"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const patientController_1 = require("../controllers/patientController");
const patientAppointmentController_1 = require("../controllers/patientAppointmentController");
const patientDataController_1 = require("../controllers/patientDataController");
const router = express_1.default.Router();
// Profile routes
router.get("/profile", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientController_1.getPatientProfile);
router.put("/profile", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientController_1.updatePatientProfile);
router.post("/change-password", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientController_1.changePassword);
// Dashboard route
router.get("/dashboard", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientController_1.getPatientDashboard);
// Booking helpers
router.get("/departments", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientController_1.getPatientDepartments);
// Appointment routes
router.post("/appointments/book", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientAppointmentController_1.bookAppointment);
router.get("/appointments", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientAppointmentController_1.getPatientAppointments);
router.get("/appointments/:appointmentId", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientAppointmentController_1.getAppointmentDetails);
router.delete("/appointments/:appointmentId", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientAppointmentController_1.cancelAppointment);
// Medical records routes
router.get("/medical-records", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientDataController_1.getMedicalRecords);
// Prescriptions routes
router.get("/prescriptions", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientDataController_1.getPrescriptions);
// Notifications routes
router.get("/notifications", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientDataController_1.getNotifications);
router.put("/notifications/:notificationId/read", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientDataController_1.markNotificationAsRead);
// Messages routes
router.get("/conversations", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientDataController_1.getConversations);
router.get("/messages/:conversationId", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientDataController_1.getMessages);
router.post("/messages", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientDataController_1.sendMessage);
router.post("/conversations/start", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(["patient"]), patientDataController_1.startConversation);
exports.default = router;
