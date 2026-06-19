import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Doctor } from "../models/Doctor";
import { User } from "../models/User";
import { Appointment } from "../models/Appointment";
import { MedicalRecord } from "../models/MedicalRecord";
import DoctorNotification from "../models/DoctorNotification";
import Prescription from "../models/Prescription";
import Review from "../models/Review";
import Message from "../models/Message";
import LabReport from "../models/LabReport";
import DoctorSchedule from "../models/DoctorSchedule";
import { Types } from "mongoose";

interface AuthRequest extends Request {
  user?: any;
}

export const getDoctorDashboardOverview = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    if (user.role !== "doctor") {
      return res.status(403).json({ error: "Access denied" });
    }

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get statistics
    const totalPatients = await Appointment.distinct("patientId", { doctorId: doctor._id });
    
    const todayAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      appointmentDate: { $gte: today, $lt: tomorrow },
    });

    const upcomingAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      appointmentDate: { $gte: tomorrow },
      status: { $nin: ["completed", "cancelled", "rejected"] },
    });

    const completedAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: "completed",
    });

    const pendingAppointments = await Appointment.countDocuments({
      doctorId: doctor._id,
      status: "pending",
    });

    const unreadMessages = await Message.countDocuments({
      receiverId: user._id,
      isRead: false,
    });

    const totalPrescriptions = await Prescription.countDocuments({
      doctorId: doctor._id,
    });

    const unreadNotifications = await DoctorNotification.countDocuments({
      doctorId: doctor._id,
      isRead: false,
    });

    // Recent notifications
    const recentNotifications = await DoctorNotification.find({ 
      doctorId: doctor._id
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent appointments
    const recentAppointments = await Appointment.find({ doctorId: doctor._id })
      .populate("patientId", "name email")
      .sort({ appointmentDate: -1 })
      .limit(5);

    res.json({
      totalPatients: totalPatients.length,
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      pendingAppointments,
      totalPrescriptions,
      unreadMessages,
      unreadNotifications,
      recentNotifications,
      recentAppointments,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getChartData = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { chartType = "weekly" } = req.query;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    if (chartType === "weekly") {
      // Weekly appointment statistics
      const weekData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = await Appointment.countDocuments({
          doctorId: doctor._id,
          appointmentDate: { $gte: date, $lt: nextDate },
        });

        weekData.push({
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          appointments: count,
        });
      }
      return res.json(weekData);
    } else if (chartType === "monthly") {
      // Monthly patient statistics
      const monthData = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleDateString("en-US", { month: "short" });

        const count = await Appointment.countDocuments({
          doctorId: doctor._id,
          appointmentDate: {
            $gte: new Date(date.getFullYear(), date.getMonth(), 1),
            $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
          },
          status: "completed",
        });

        monthData.push({
          month: monthName,
          completed: count,
        });
      }
      return res.json(monthData);
    } else if (chartType === "consultation") {
      // Consultation trends
      const trendData = await Appointment.aggregate([
        { $match: { doctorId: new Types.ObjectId(doctor._id as any) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
      return res.json(trendData);
    }

    return res.json([]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDoctorPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10 } = req.query;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate("patientId", "name email phone gender bloodGroup")
      .populate("appointmentId", "appointmentDate timeSlot status")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Prescription.countDocuments({ doctorId: doctor._id });

    return res.json({ prescriptions, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const getDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const doctor = await Doctor.findOne({ userId: user._id }).lean();

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const userDetails = await User.findById(user._id).select("-password").lean();

    res.json({ ...doctor, user: userDetails });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const {
      name,
      phone,
      gender,
      dob,
      qualification,
      specialization,
      experience,
      licenseNumber,
      address,
      description,
      consultationFee,
    } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          name,
          phone,
          gender,
          dob,
          qualification,
          specialization,
          experience,
          licenseNumber,
          address,
          description,
          consultationFee,
        },
      },
      { new: true }
    );

    // Update user details
    await User.findByIdAndUpdate(user._id, { name, phone, gender, dob, address });

    res.json({ message: "Profile updated successfully", doctor });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDoctorAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { status, page = 1, limit = 10 } = req.query;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const query: any = { doctorId: doctor._id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate("patientId", "name email phone")
      .populate("departmentId", "name")
      .sort({ appointmentDate: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Appointment.countDocuments(query);

    res.json({ appointments, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;
    const { user } = req;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, doctorId: doctor._id },
      { status, notes, updatedAt: new Date() },
      { new: true }
    ).populate("patientId");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Create notification
    if (appointment.patientId) {
      const patientUser = appointment.patientId as any;
      await DoctorNotification.create({
        doctorId: doctor._id,
        title: "Appointment Status Updated",
        message: `Your appointment status has been updated to ${status}`,
        type: "appointment",
        relatedId: appointmentId,
      });
    }

    res.json({ message: "Appointment updated successfully", appointment });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDoctorPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10, search = "" } = req.query;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const query: any = { doctorId: doctor._id };
    const appointments = await Appointment.find(query).select("patientId");
    const patientIds = [...new Set(appointments.map((a) => a.patientId.toString()))];

    let userQuery: any = { _id: { $in: patientIds }, role: "patient" };
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const patients = await User.find(userQuery)
      .select("-password")
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(userQuery);

    res.json({ patients, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPatientDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.params;
    const { user } = req;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Verify doctor has treated this patient
    const appointment = await Appointment.findOne({
      patientId,
      doctorId: doctor._id,
    });

    if (!appointment && user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const patient = await User.findById(patientId).select("-password").lean();
    const medicalRecords = await MedicalRecord.find({ patientId }).sort({ visitDate: -1 });
    const prescriptions = await Prescription.find({ patientId, doctorId: doctor._id });
    const appointments = await Appointment.find({ patientId, doctorId: doctor._id }).sort({ appointmentDate: -1 });

    res.json({
      patient,
      medicalRecords,
      prescriptions,
      appointments,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { patientId, diagnosis, treatment, notes, visitDate } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const medicalRecord = new MedicalRecord({
      doctorId: doctor._id,
      patientId,
      diagnosis,
      treatment,
      notes,
      visitDate,
    });

    await medicalRecord.save();

    res.status(201).json({ message: "Medical record created", medicalRecord });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { patientId, appointmentId, medicines, diagnosis, notes } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const prescription = new Prescription({
      doctorId: doctor._id,
      patientId,
      appointmentId,
      medicines,
      diagnosis,
      notes,
    });

    await prescription.save();

    res.status(201).json({ message: "Prescription created", prescription });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDoctorMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10 } = req.query;

    const messages = await Message.find({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    })
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Message.countDocuments({
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    });

    res.json({ messages, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { receiverId, message, appointmentId } = req.body;

    const newMessage = new Message({
      senderId: user._id,
      senderRole: user.role,
      receiverId,
      message,
      appointmentId,
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent", data: newMessage });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getDoctorReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10 } = req.query;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const reviews = await Review.find({ doctorId: doctor._id, status: "approved" })
      .populate("patientId", "name")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalReviews = await Review.countDocuments({ doctorId: doctor._id, status: "approved" });
    const avgRating = await Review.aggregate([
      { $match: { doctorId: doctor._id, status: "approved" } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    res.json({
      reviews,
      totalReviews,
      avgRating: avgRating[0]?.avgRating || 0,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10, isRead } = req.query;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const query: any = { doctorId: doctor._id };
    if (isRead !== undefined) {
      query.isRead = isRead === "true";
    }

    const notifications = await DoctorNotification.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await DoctorNotification.countDocuments(query);

    res.json({ notifications, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;

    const notification = await DoctorNotification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ============== LAB REPORTS ==============
export const getLabReports = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { page = 1, limit = 10, status } = req.query;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const skip = (Number(page) - 1) * Number(limit);
    let query: any = { doctorId: doctor._id };

    if (status) query.status = status;

    const reports = await LabReport.find(query)
      .populate("patientId", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ reportDate: -1 });

    const total = await LabReport.countDocuments(query);

    return res.json({
      reports,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const updateLabReportStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { status, doctorNotes } = req.body;

    const report = await LabReport.findByIdAndUpdate(
      reportId,
      {
        status,
        doctorNotes,
        reviewedAt: status === "reviewed" ? new Date() : undefined,
      },
      { new: true }
    );

    return res.json({ message: "Lab report updated", report });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

// ============== SCHEDULE MANAGEMENT ==============
export const getSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const schedule = await DoctorSchedule.find({ doctorId: doctor._id }).sort({ day: 1 });

    return res.json(schedule);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { day, timeSlots, isWorkingDay, notes } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const schedule = await DoctorSchedule.findOneAndUpdate(
      { doctorId: doctor._id, day },
      { timeSlots, isWorkingDay, notes },
      { new: true, upsert: true }
    );

    return res.json({ message: "Schedule updated", schedule });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

// ============== GENERATE REPORTS ==============
export const generateConsultationReport = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { reportType = "daily", dateFrom, dateTo } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    let dateRange: any = {};

    if (reportType === "daily") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateRange = { $gte: today, $lt: tomorrow };
    } else if (reportType === "weekly") {
      const today = new Date();
      const firstDay = new Date(today);
      firstDay.setDate(today.getDate() - today.getDay());
      firstDay.setHours(0, 0, 0, 0);
      dateRange = { $gte: firstDay };
    } else if (reportType === "monthly") {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      dateRange = { $gte: firstDay };
    }

    if (dateFrom && dateTo) {
      dateRange = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo),
      };
    }

    const appointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentDate: dateRange,
    }).populate("patientId");

    const statistics = {
      totalAppointments: appointments.length,
      completed: appointments.filter((a) => a.status === "completed").length,
      pending: appointments.filter((a) => a.status === "pending").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      rejected: appointments.filter((a) => a.status === "rejected").length,
      totalPatients: new Set(appointments.map((a) => a.patientId._id.toString())).size,
    };

    return res.json({
      reportType,
      statistics,
      appointments,
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

// ============== PROFILE PICTURE UPLOAD ==============
export const uploadProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { profileImage } = req.body; // Base64 or URL

    const doctor = await Doctor.findOneAndUpdate(
      { userId: user._id },
      { profileImage },
      { new: true }
    );

    return res.json({ message: "Profile picture updated", doctor });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const changeDoctorPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { currentPassword, newPassword } = req.body;

    const dbUser = await User.findById(user._id);
    if (!dbUser) return res.status(404).json({ error: "User not found" });

    const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    dbUser.password = hashedPassword;
    await dbUser.save();

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

// ============== SETTINGS ==============
export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Return notification preferences and privacy settings
    return res.json({
      notificationPreferences: {
        emailNotifications: true,
        appointmentReminders: true,
        newPatientAlerts: true,
      },
      privacySettings: {
        showProfile: true,
        allowMessages: true,
        shareReviews: true,
      },
      securitySettings: {
        twoFactorAuth: false,
        loginAlerts: true,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { notificationPreferences, privacySettings, securitySettings } = req.body;

    // Store settings (ideally in a separate collection)
    // For now, returning success
    return res.json({
      message: "Settings updated successfully",
      settings: {
        notificationPreferences,
        privacySettings,
        securitySettings,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
};
