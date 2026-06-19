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
exports.deleteUnavailableDate = exports.getUnavailableDates = exports.markUnavailableDate = exports.updateDoctorSchedule = exports.getDoctorSchedule = void 0;
const DoctorSchedule_1 = __importDefault(require("../models/DoctorSchedule"));
const UnavailableDate_1 = __importDefault(require("../models/UnavailableDate"));
const Doctor_1 = require("../models/Doctor");
const getDoctorSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const schedule = yield DoctorSchedule_1.default.find({ doctorId: doctor._id });
        res.json(schedule);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getDoctorSchedule = getDoctorSchedule;
const updateDoctorSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { day, timeSlots, isWorkingDay, notes } = req.body;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        let schedule = yield DoctorSchedule_1.default.findOneAndUpdate({ doctorId: doctor._id, day }, {
            $set: {
                timeSlots,
                isWorkingDay,
                notes,
            },
        }, { new: true, upsert: true });
        res.json({ message: "Schedule updated", schedule });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.updateDoctorSchedule = updateDoctorSchedule;
const markUnavailableDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const { date, endDate, reason, type } = req.body;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const unavailable = new UnavailableDate_1.default({
            doctorId: doctor._id,
            date,
            endDate,
            reason,
            type,
        });
        yield unavailable.save();
        res.status(201).json({ message: "Date marked unavailable", unavailable });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.markUnavailableDate = markUnavailableDate;
const getUnavailableDates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        const unavailableDates = yield UnavailableDate_1.default.find({ doctorId: doctor._id }).sort({
            date: -1,
        });
        res.json(unavailableDates);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.getUnavailableDates = getUnavailableDates;
const deleteUnavailableDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dateId } = req.params;
        const { user } = req;
        const doctor = yield Doctor_1.Doctor.findOne({ userId: user._id });
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        yield UnavailableDate_1.default.findByIdAndDelete(dateId);
        res.json({ message: "Date removed from unavailable" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.deleteUnavailableDate = deleteUnavailableDate;
