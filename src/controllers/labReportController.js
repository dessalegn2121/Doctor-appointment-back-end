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
exports.addLabReportNotes = exports.uploadLabReport = exports.getLabReportById = exports.getLabReports = void 0;
const LabReport_1 = __importDefault(require("../models/LabReport"));
const Doctor_1 = require("../models/Doctor");
const getLabReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { patientId, status, page = 1, limit = 10 } = req.query;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const query = { doctorId: doctor._id };
        if (patientId)
            query.patientId = patientId;
        if (status)
            query.status = status;
        const reports = yield LabReport_1.default.find(query)
            .populate("patientId", "name email")
            .sort({ reportDate: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = yield LabReport_1.default.countDocuments(query);
        res.json({ reports, total, page, limit });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getLabReports = getLabReports;
const getLabReportById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reportId } = req.params;
        const { user } = req;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const report = yield LabReport_1.default.findOne({
            _id: reportId,
            doctorId: doctor._id,
        }).populate("patientId");
        if (!report) {
            return res.status(404).json({ error: "Lab report not found" });
        }
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getLabReportById = getLabReportById;
const uploadLabReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { patientId, testName, testDescription, results, fileUrl, appointmentId } = req.body;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const report = new LabReport_1.default({
            doctorId: doctor._id,
            patientId,
            appointmentId,
            testName,
            testDescription,
            results,
            fileUrl,
            status: "completed",
        });
        yield report.save();
        res.status(201).json({ message: "Lab report uploaded", report });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.uploadLabReport = uploadLabReport;
const addLabReportNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reportId } = req.params;
        const { user } = req;
        const { doctorNotes } = req.body;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const report = yield LabReport_1.default.findOneAndUpdate({ _id: reportId, doctorId: doctor._id }, {
            doctorNotes,
            status: "reviewed",
            reviewedAt: new Date(),
        }, { new: true });
        if (!report) {
            return res.status(404).json({ error: "Lab report not found" });
        }
        res.json({ message: "Notes added to lab report", report });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.addLabReportNotes = addLabReportNotes;
