import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware";
import {
  getDoctorDashboardOverview,
  getChartData,
  getDoctorProfile,
  updateDoctorProfile,
  changeDoctorPassword,
  getDoctorAppointments,
  updateAppointmentStatus,
  getDoctorPatients,
  getPatientDetails,
  createMedicalRecord,
  createPrescription,
  getDoctorPrescriptions,
  getDoctorMessages,
  sendMessage,
  getDoctorReviews,
  getNotifications,
  markNotificationAsRead,
  getLabReports,
  updateLabReportStatus,
  getSchedule,
  updateSchedule,
  generateConsultationReport,
  uploadProfilePicture,
  getSettings,
  updateSettings,
} from "../controllers/doctorDashboardController";

const router = Router();

// Middleware to verify doctor role
const checkDoctor = (req: any, res: any, next: any) => {
  if (req.user?.role !== "doctor") {
    return res.status(403).json({ error: "Access denied. Doctor role required." });
  }
  next();
};

// ============ DASHBOARD OVERVIEW ============
router.get("/overview", verifyToken, checkDoctor, getDoctorDashboardOverview);
router.get("/chart-data", verifyToken, checkDoctor, getChartData);

// ============ PROFILE ============
router.get("/profile", verifyToken, checkDoctor, getDoctorProfile);
router.put("/profile", verifyToken, checkDoctor, updateDoctorProfile);
router.post("/profile/picture", verifyToken, checkDoctor, uploadProfilePicture);
router.post("/password", verifyToken, checkDoctor, changeDoctorPassword);

// ============ APPOINTMENTS ============
router.get("/appointments", verifyToken, checkDoctor, getDoctorAppointments);
router.put("/appointments/:appointmentId/status", verifyToken, checkDoctor, updateAppointmentStatus);

// ============ PATIENTS ============
router.get("/patients", verifyToken, checkDoctor, getDoctorPatients);
router.get("/patients/:patientId", verifyToken, checkDoctor, getPatientDetails);

// ============ MEDICAL RECORDS ============
router.post("/medical-records", verifyToken, checkDoctor, createMedicalRecord);

// ============ PRESCRIPTIONS ============
router.post("/prescriptions", verifyToken, checkDoctor, createPrescription);
router.get("/prescriptions", verifyToken, checkDoctor, getDoctorPrescriptions);

// ============ LAB REPORTS ============
router.get("/lab-reports", verifyToken, checkDoctor, getLabReports);
router.put("/lab-reports/:reportId", verifyToken, checkDoctor, updateLabReportStatus);

// ============ MESSAGES ============
router.get("/messages", verifyToken, checkDoctor, getDoctorMessages);
router.post("/messages", verifyToken, checkDoctor, sendMessage);

// ============ NOTIFICATIONS ============
router.get("/notifications", verifyToken, checkDoctor, getNotifications);
router.put("/notifications/:notificationId/read", verifyToken, checkDoctor, markNotificationAsRead);

// ============ REVIEWS ============
router.get("/reviews", verifyToken, checkDoctor, getDoctorReviews);

// ============ SCHEDULE ============
router.get("/schedule", verifyToken, checkDoctor, getSchedule);
router.put("/schedule", verifyToken, checkDoctor, updateSchedule);

// ============ REPORTS ============
router.post("/reports/consultation", verifyToken, checkDoctor, generateConsultationReport);

// ============ SETTINGS ============
router.get("/settings", verifyToken, checkDoctor, getSettings);
router.put("/settings", verifyToken, checkDoctor, updateSettings);

export default router;
