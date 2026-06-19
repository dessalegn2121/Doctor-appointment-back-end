import { Router } from "express";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  getDoctorPatients,
  updateAppointment,
} from "../controllers/appointmentController";
import { requireRole, verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", verifyToken, requireRole(["patient"]), createAppointment);
router.get("/", verifyToken, getAppointments);
router.get("/patients", verifyToken, requireRole(["doctor", "admin"]), getDoctorPatients);
router.delete("/:id", verifyToken, requireRole(["patient", "admin"]), deleteAppointment);
router.put("/:id", verifyToken, requireRole(["doctor", "admin"]), updateAppointment);

export default router;

