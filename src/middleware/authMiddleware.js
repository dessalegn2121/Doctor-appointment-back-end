"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPatient = exports.checkDoctor = exports.requireRole = exports.checkAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getJwtSecretOrThrow = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is not defined");
    return secret;
};
const verifyToken = (req, res, next) => {
    const header = req.headers.authorization;
    const token = (header === null || header === void 0 ? void 0 : header.startsWith("Bearer ")) ? header.slice(7) : undefined;
    if (!token)
        return res.status(401).json({ message: "No token provided" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, getJwtSecretOrThrow());
        req.user = { id: decoded.id, _id: decoded.id, role: decoded.role };
        return next();
    }
    catch (_a) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
exports.verifyToken = verifyToken;
const checkAdmin = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    return next();
};
exports.checkAdmin = checkAdmin;
const requireRole = (roles) => (req, res, next) => {
    if (!req.user)
        return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: `Requires role: ${roles.join(", ")}` });
    }
    return next();
};
exports.requireRole = requireRole;
exports.checkDoctor = (0, exports.requireRole)(["doctor"]);
exports.checkPatient = (0, exports.requireRole)(["patient"]);
