import { Router } from "express";
import {
  createDoctor,
  deleteDoctor,
  getDoctorById,
  getDoctors,
  updateDoctor,
} from "../controllers/doctorController";
import { checkAdmin, verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getDoctors);
router.get("/:id", getDoctorById);
router.post("/", verifyToken, checkAdmin, createDoctor);
router.put("/:id", verifyToken, checkAdmin, updateDoctor);
router.delete("/:id", verifyToken, checkAdmin, deleteDoctor);

export default router;

