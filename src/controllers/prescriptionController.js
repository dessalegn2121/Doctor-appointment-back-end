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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadPrescription = exports.updatePrescription = exports.getPrescriptionById = exports.getPrescriptions = void 0;
const Prescription_1 = __importDefault(require("../models/Prescription"));
const Doctor_1 = require("../models/Doctor");
const getPrescriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { patientId, page = 1, limit = 10 } = req.query;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const query = { doctorId: doctor._id };
        if (patientId)
            query.patientId = patientId;
        const prescriptions = yield Prescription_1.default.find(query)
            .populate("patientId", "name email")
            .sort({ issueDate: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield Prescription_1.default.countDocuments(query);
        res.json({ prescriptions, total, page, limit });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPrescriptions = getPrescriptions;
const getPrescriptionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prescriptionId } = req.params;
        const { user } = req;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const prescription = yield Prescription_1.default.findOne({
            _id: prescriptionId,
            doctorId: doctor._id,
        }).populate("patientId");
        if (!prescription) {
            return res.status(404).json({ error: "Prescription not found" });
        }
        res.json(prescription);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getPrescriptionById = getPrescriptionById;
const updatePrescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prescriptionId } = req.params;
        const { user } = req;
        const { medicines, diagnosis, notes, status } = req.body;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const prescription = yield Prescription_1.default.findOneAndUpdate({ _id: prescriptionId, doctorId: doctor._id }, { medicines, diagnosis, notes, status }, { new: true });
        if (!prescription) {
            return res.status(404).json({ error: "Prescription not found" });
        }
        res.json({ message: "Prescription updated", prescription });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updatePrescription = updatePrescription;
const downloadPrescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prescriptionId } = req.params;
        const { user } = req;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const prescription = yield Prescription_1.default.findOne({
            _id: prescriptionId,
            doctorId: doctor._id,
        }).populate("patientId");
        if (!prescription) {
            return res.status(404).json({ error: "Prescription not found" });
        }
        // Generate PDF in production (use pdfkit or similar)
        res.json({
            prescription,
            message: "PDF generation would be implemented here",
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.downloadPrescription = downloadPrescription;
