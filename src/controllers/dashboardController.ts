import { Request, Response } from "express";
import { User } from "../models/User";
import { Doctor } from "../models/Doctor";
import { Appointment } from "../models/Appointment";
import { Department } from "../models/Department";
import { AuditLog } from "../models/AuditLog";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalDoctors = await Doctor.countDocuments({ status: "active" });
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalAppointments = await Appointment.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
    });

    const pendingAppointments = await Appointment.countDocuments({ status: "pending" });
    const approvedAppointments = await Appointment.countDocuments({ status: "approved" });
    const cancelledAppointments = await Appointment.countDocuments({ status: "cancelled" });
    const completedAppointments = await Appointment.countDocuments({ status: "completed" });

    return res.json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      approvedAppointments,
      cancelledAppointments,
      completedAppointments,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching dashboard stats", error });
  }
};

export const getMonthlyStats = async (req: Request, res: Response) => {
  try {
    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      last12Months.push({
        month: date.toLocaleString("default", { month: "short", year: "2-digit" }),
        date,
      });
    }

    const stats = await Promise.all(
      last12Months.map(async (item) => {
        const startDate = new Date(item.date.getFullYear(), item.date.getMonth(), 1);
        const endDate = new Date(item.date.getFullYear(), item.date.getMonth() + 1, 1);

        const count = await Appointment.countDocuments({
          appointmentDate: { $gte: startDate, $lt: endDate },
        });

        return { month: item.month, appointments: count };
      })
    );

    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching monthly stats", error });
  }
};

export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const activities = await AuditLog.find().sort({ timestamp: -1 }).limit(10).populate("userId", "name email");
    return res.json(activities);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching activities", error });
  }
};

export const getAppointmentStats = async (req: Request, res: Response) => {
  try {
    const stats = {
      pending: await Appointment.countDocuments({ status: "pending" }),
      approved: await Appointment.countDocuments({ status: "approved" }),
      completed: await Appointment.countDocuments({ status: "completed" }),
      cancelled: await Appointment.countDocuments({ status: "cancelled" }),
      rejected: await Appointment.countDocuments({ status: "rejected" }),
    };
    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching appointment stats", error });
  }
};

export const getDoctorPerformance = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find({ status: "active" })
      .select("name specialization totalAppointments completedAppointments rating")
      .sort({ totalAppointments: -1 })
      .limit(10);

    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching doctor performance", error });
  }
};

export const getDepartmentStats = async (req: Request, res: Response) => {
  try {
    const departments = await Department.find({ status: "active" });

    const stats = await Promise.all(
      departments.map(async (dept) => {
        const doctors = await Doctor.countDocuments({ department: dept.name });
        const appointments = await Appointment.countDocuments({ departmentId: dept._id });
        return {
          name: dept.name,
          doctors,
          appointments,
        };
      })
    );

    return res.json(stats);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching department stats", error });
  }
};
