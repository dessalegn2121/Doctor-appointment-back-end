import express from "express";
import { verifyToken, requireRole } from "../middleware/authMiddleware";
import {
  getPatientProfile,
  updatePatientProfile,
  changePassword,
  getPatientDashboard,
  getPatientDepartments,
} from "../controllers/patientController";
import {
  bookAppointment,
  getPatientAppointments,
  cancelAppointment,
  getAppointmentDetails,
} from "../controllers/patientAppointmentController";
import {
  getMedicalRecords,
  getPrescriptions,
  getNotifications,
  markNotificationAsRead,
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
} from "../controllers/patientDataController";

const router = express.Router();

// Profile routes
router.get("/profile", verifyToken, requireRole(["patient"]), getPatientProfile);
router.put("/profile", verifyToken, requireRole(["patient"]), updatePatientProfile);
router.post("/change-password", verifyToken, requireRole(["patient"]), changePassword);

// Dashboard route
router.get("/dashboard", verifyToken, requireRole(["patient"]), getPatientDashboard);

// Booking helpers
router.get("/departments", verifyToken, requireRole(["patient"]), getPatientDepartments);

// Appointment routes
router.post("/appointments/book", verifyToken, requireRole(["patient"]), bookAppointment);
router.get("/appointments", verifyToken, requireRole(["patient"]), getPatientAppointments);
router.get("/appointments/:appointmentId", verifyToken, requireRole(["patient"]), getAppointmentDetails);
router.delete("/appointments/:appointmentId", verifyToken, requireRole(["patient"]), cancelAppointment);

// Medical records routes
router.get("/medical-records", verifyToken, requireRole(["patient"]), getMedicalRecords);

// Prescriptions routes
router.get("/prescriptions", verifyToken, requireRole(["patient"]), getPrescriptions);

// Notifications routes
router.get("/notifications", verifyToken, requireRole(["patient"]), getNotifications);
router.put("/notifications/:notificationId/read", verifyToken, requireRole(["patient"]), markNotificationAsRead);

// Messages routes
router.get("/conversations", verifyToken, requireRole(["patient"]), getConversations);
router.get("/messages/:conversationId", verifyToken, requireRole(["patient"]), getMessages);
router.post("/messages", verifyToken, requireRole(["patient"]), sendMessage);
router.post("/conversations/start", verifyToken, requireRole(["patient"]), startConversation);

export default router;
