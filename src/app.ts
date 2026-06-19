import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import doctorDashboardRoutes from "./routes/doctorDashboardRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import patientRoutes from "./routes/patientRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/health", (_req, res) => res.json({ ok: true, name: "Tepi General Hospital API" }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/doctor-dashboard", doctorDashboardRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/patient", patientRoutes);

export default app;

