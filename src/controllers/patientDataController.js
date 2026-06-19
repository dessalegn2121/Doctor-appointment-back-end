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
exports.startConversation = exports.sendMessage = exports.getMessages = exports.getConversations = exports.markNotificationAsRead = exports.getNotifications = exports.getPrescriptions = exports.getMedicalRecords = void 0;
const MedicalRecord_1 = require("../models/MedicalRecord");
const Prescription_1 = __importDefault(require("../models/Prescription"));
const Notification_1 = require("../models/Notification");
const PatientMessage_1 = require("../models/PatientMessage");
const getMedicalRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const records = yield MedicalRecord_1.MedicalRecord.find({ patientId: req.user.id })
            .populate("doctorId", "name specialization")
            .sort({ recordDate: -1 });
        return res.json(records);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getMedicalRecords = getMedicalRecords;
const getPrescriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const prescriptions = yield Prescription_1.default.find({ patientId: req.user.id })
            .populate("doctorId", "name specialization")
            .sort({ prescriptionDate: -1 });
        return res.json(prescriptions);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getPrescriptions = getPrescriptions;
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const notifications = yield Notification_1.Notification.find({ recipientId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        return res.json(notifications);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getNotifications = getNotifications;
const markNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { notificationId } = req.params;
        const notification = yield Notification_1.Notification.findByIdAndUpdate(notificationId, { isRead: true, readAt: new Date() }, { new: true });
        if (!notification)
            return res.status(404).json({ message: "Notification not found" });
        return res.json(notification);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const conversations = yield PatientMessage_1.Conversation.find({ patientId: req.user.id })
            .populate("doctorId", "name specialization profileImage")
            .sort({ lastMessageTime: -1 });
        return res.json(conversations);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getConversations = getConversations;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { conversationId } = req.params;
        const messages = yield PatientMessage_1.PatientMessage.find({ conversationId })
            .sort({ createdAt: 1 });
        return res.json(messages);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getMessages = getMessages;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { conversationId, receiverId, message } = req.body;
        if (!conversationId || !receiverId || !message) {
            return res.status(400).json({ message: "Conversation ID, receiver ID, and message are required" });
        }
        const newMessage = yield PatientMessage_1.PatientMessage.create({
            senderId: req.user.id,
            senderType: "patient",
            receiverId,
            receiverType: "doctor",
            conversationId,
            message,
        });
        // Update conversation
        yield PatientMessage_1.Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message,
            lastMessageTime: new Date(),
        });
        return res.status(201).json(newMessage);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.sendMessage = sendMessage;
const startConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { doctorId } = req.body;
        if (!doctorId)
            return res.status(400).json({ message: "Doctor ID is required" });
        // Check if conversation already exists
        let conversation = yield PatientMessage_1.Conversation.findOne({
            patientId: req.user.id,
            doctorId,
        });
        if (!conversation) {
            conversation = yield PatientMessage_1.Conversation.create({
                patientId: req.user.id,
                doctorId,
            });
        }
        const populatedConversation = yield conversation.populate("doctorId", "name specialization profileImage");
        return res.json(populatedConversation);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.startConversation = startConversation;
