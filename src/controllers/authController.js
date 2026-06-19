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
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const Doctor_1 = require("../models/Doctor");
const signToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is not defined");
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: "7d" });
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phone, gender, dob, role, qualification, specialization, experience, licenseNumber } = req.body;
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "name, email, password, and phone are required" });
        }
        const existing = yield User_1.User.findOne({ email });
        if (existing)
            return res.status(409).json({ message: "Email already in use" });
        const hashed = yield bcryptjs_1.default.hash(password, 10);
        const userRole = role && ["admin", "doctor", "patient"].includes(role) ? role : "patient";
        const user = yield User_1.User.create({
            name,
            email,
            password: hashed,
            phone,
            gender: gender || "other",
            dob: dob ? new Date(dob) : undefined,
            role: userRole,
        });
        // If registering as doctor, create a Doctor record
        if (userRole === "doctor") {
            yield Doctor_1.Doctor.create({
                userId: user._id,
                name,
                email,
                phone,
                gender: gender || "other",
                dob: dob ? new Date(dob) : new Date(),
                qualification: qualification || "MD",
                specialization: specialization || "General Practice",
                experience: experience ? parseInt(experience) : 0,
                licenseNumber: licenseNumber || `LICENSE-${user._id}`,
                consultationFee: 100,
                status: "active",
            });
        }
        const token = signToken({ id: user._id.toString(), role: user.role });
        return res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Registration failed", error: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "email and password are required" });
        const user = yield User_1.User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });
        const ok = yield bcryptjs_1.default.compare(password, user.password);
        if (!ok)
            return res.status(401).json({ message: "Invalid credentials" });
        const token = signToken({ id: user._id.toString(), role: user.role });
        return res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Login failed", error });
    }
});
exports.login = login;
