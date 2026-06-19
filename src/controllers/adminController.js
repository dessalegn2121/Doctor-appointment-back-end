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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = exports.deleteDepartment = exports.updateDepartment = exports.createDepartment = exports.getDepartments = exports.deletePatient = exports.getPatients = void 0;
const User_1 = require("../models/User");
const Appointment_1 = require("../models/Appointment");
const Department_1 = require("../models/Department");
const Settings_1 = require("../models/Settings");
const getPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const patients = yield User_1.User.find({ role: "patient" })
            .select("name email createdAt")
            .sort({ createdAt: -1 });
        return res.json(patients);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch patients", error });
    }
});
exports.getPatients = getPatients;
const deletePatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const patientId = req.params.id;
        const patient = yield User_1.User.findById(patientId);
        if (!patient || patient.role !== "patient") {
            return res.status(404).json({ message: "Patient not found" });
        }
        yield Appointment_1.Appointment.deleteMany({ patientId: patient._id });
        yield User_1.User.findByIdAndDelete(patient._id);
        return res.json({ message: "Patient deleted" });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to delete patient", error });
    }
});
exports.deletePatient = deletePatient;
// Department management
const getDepartments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const departments = yield Department_1.Department.find().sort({ createdAt: -1 });
        return res.json(departments);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch departments", error });
    }
});
exports.getDepartments = getDepartments;
const createDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { name, description } = req.body;
        if (!name)
            return res.status(400).json({ message: "Department name is required" });
        const newDepartment = new Department_1.Department({ name, description });
        const savedDepartment = yield newDepartment.save();
        return res.status(201).json(savedDepartment);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to create department", error });
    }
});
exports.createDepartment = createDepartment;
const updateDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;
        const { name, description } = req.body;
        const updatedDepartment = yield Department_1.Department.findByIdAndUpdate(id, { name, description }, { new: true, runValidators: true });
        if (!updatedDepartment) {
            return res.status(404).json({ message: "Department not found" });
        }
        return res.json(updatedDepartment);
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to update department", error });
    }
});
exports.updateDepartment = updateDepartment;
const deleteDepartment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;
        const deletedDepartment = yield Department_1.Department.findByIdAndDelete(id);
        if (!deletedDepartment) {
            return res.status(404).json({ message: "Department not found" });
        }
        return res.json({ message: "Department deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to delete department", error });
    }
});
exports.deleteDepartment = deleteDepartment;
// Settings management
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        let settings = yield Settings_1.Settings.findOne();
        if (!settings) {
            settings = new Settings_1.Settings({
                hospitalName: "Doctor Appointment System",
            });
            yield settings.save();
        }
        return res.json({
            appName: settings.hospitalName,
            appEmail: settings.email,
            phone: settings.phone,
            address: settings.address,
            about: ((_a = settings.settings) === null || _a === void 0 ? void 0 : _a.about) || "",
            workingHours: `${settings.openingHours} - ${settings.closingHours}`,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch settings", error });
    }
});
exports.getSettings = getSettings;
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { appName, appEmail, phone, address, about, workingHours } = req.body;
        let settings = yield Settings_1.Settings.findOne();
        if (!settings) {
            settings = new Settings_1.Settings();
        }
        settings.hospitalName = appName || settings.hospitalName;
        settings.email = appEmail || settings.email;
        settings.phone = phone || settings.phone;
        settings.address = address || settings.address;
        if (workingHours) {
            const [opening, closing] = workingHours.split(" - ");
            settings.openingHours = (opening === null || opening === void 0 ? void 0 : opening.trim()) || settings.openingHours;
            settings.closingHours = (closing === null || closing === void 0 ? void 0 : closing.trim()) || settings.closingHours;
        }
        if (about) {
            settings.settings = settings.settings || {};
            settings.settings.about = about;
        }
        const updatedSettings = yield settings.save();
        return res.json({
            appName: updatedSettings.hospitalName,
            appEmail: updatedSettings.email,
            phone: updatedSettings.phone,
            address: updatedSettings.address,
            about: ((_a = updatedSettings.settings) === null || _a === void 0 ? void 0 : _a.about) || "",
            workingHours: `${updatedSettings.openingHours} - ${updatedSettings.closingHours}`,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to update settings", error });
    }
});
exports.updateSettings = updateSettings;
