import { Router } from "express";
import { checkAdmin, verifyToken } from "../middleware/authMiddleware";
import { deletePatient, getPatients } from "../controllers/adminController";
import * as dashboardController from "../controllers/dashboardController";
import * as doctorController from "../controllers/doctorController";

const router = Router();

// Patient management routes
router.get("/patients", verifyToken, checkAdmin, getPatients);
router.delete("/patients/:id", verifyToken, checkAdmin, deletePatient);

// Dashboard routes
router.get("/dashboard/stats", verifyToken, checkAdmin, dashboardController.getDashboardStats);
router.get("/dashboard/monthly", verifyToken, checkAdmin, dashboardController.getMonthlyStats);
router.get("/dashboard/activities", verifyToken, checkAdmin, dashboardController.getRecentActivities);
router.get("/dashboard/appointments", verifyToken, checkAdmin, dashboardController.getAppointmentStats);
router.get("/dashboard/doctor-performance", verifyToken, checkAdmin, dashboardController.getDoctorPerformance);
router.get("/dashboard/department-stats", verifyToken, checkAdmin, dashboardController.getDepartmentStats);

// Doctor management routes
router.get("/doctors", verifyToken, checkAdmin, doctorController.getDoctors);
router.get("/doctors/:id", verifyToken, checkAdmin, doctorController.getDoctorById);
router.post("/doctors", verifyToken, checkAdmin, doctorController.createDoctor);
router.put("/doctors/:id", verifyToken, checkAdmin, doctorController.updateDoctor);
router.delete("/doctors/:id", verifyToken, checkAdmin, doctorController.deleteDoctor);

export default router;

