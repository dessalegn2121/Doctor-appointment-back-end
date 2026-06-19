import { Response } from "express";
import { MedicalRecord } from "../models/MedicalRecord";
import { Prescription } from "../models/Prescription";
import { Notification } from "../models/Notification";
import { PatientMessage, Conversation } from "../models/PatientMessage";
import { AuthRequest } from "../middleware/authMiddleware";

export const getMedicalRecords = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const records = await MedicalRecord.find({ patientId: req.user.id })
      .populate("doctorId", "name specialization")
      .sort({ recordDate: -1 });

    return res.json(records);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const prescriptions = await Prescription.find({ patientId: req.user.id })
      .populate("doctorId", "name specialization")
      .sort({ prescriptionDate: -1 });

    return res.json(prescriptions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const notifications = await Notification.find({ recipientId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(notifications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    return res.json(notification);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const conversations = await Conversation.find({ patientId: req.user.id })
      .populate("doctorId", "name specialization profileImage")
      .sort({ lastMessageTime: -1 });

    return res.json(conversations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { conversationId } = req.params;

    const messages = await PatientMessage.find({ conversationId })
      .sort({ createdAt: 1 });

    return res.json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { conversationId, receiverId, message } = req.body;

    if (!conversationId || !receiverId || !message) {
      return res.status(400).json({ message: "Conversation ID, receiver ID, and message are required" });
    }

    const newMessage = await PatientMessage.create({
      senderId: req.user.id,
      senderType: "patient",
      receiverId,
      receiverType: "doctor",
      conversationId,
      message,
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message,
      lastMessageTime: new Date(),
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const startConversation = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { doctorId } = req.body;

    if (!doctorId) return res.status(400).json({ message: "Doctor ID is required" });

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      patientId: req.user.id,
      doctorId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        patientId: req.user.id,
        doctorId,
      });
    }

    const populatedConversation = await conversation.populate("doctorId", "name specialization profileImage");

    return res.json(populatedConversation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
