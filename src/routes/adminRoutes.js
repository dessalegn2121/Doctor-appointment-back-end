"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminController_1 = require("../controllers/adminController");
const dashboardController = __importStar(require("../controllers/dashboardController"));
const doctorController = __importStar(require("../controllers/doctorController"));
const router = (0, express_1.Router)();
// Patient management routes
router.get("/patients", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, adminController_1.getPatients);
router.delete("/patients/:id", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, adminController_1.deletePatient);
// Dashboard routes
router.get("/dashboard/stats", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, dashboardController.getDashboardStats);
router.get("/dashboard/monthly", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, dashboardController.getMonthlyStats);
router.get("/dashboard/activities", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, dashboardController.getRecentActivities);
router.get("/dashboard/appointments", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, dashboardController.getAppointmentStats);
router.get("/dashboard/doctor-performance", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, dashboardController.getDoctorPerformance);
router.get("/dashboard/department-stats", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, dashboardController.getDepartmentStats);
// Doctor management routes
router.get("/doctors", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, doctorController.getDoctors);
router.get("/doctors/:id", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, doctorController.getDoctorById);
router.post("/doctors", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, doctorController.createDoctor);
router.put("/doctors/:id", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, doctorController.updateDoctor);
router.delete("/doctors/:id", authMiddleware_1.verifyToken, authMiddleware_1.checkAdmin, doctorController.deleteDoctor);
exports.default = router;
