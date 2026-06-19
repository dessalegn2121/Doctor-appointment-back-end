import { Request, Response } from "express";
import LabReport from "../models/LabReport";
import Doctor from "../models/Doctor";

interface AuthRequest extends Request {
  user?: any;
}

export const getLabReports = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { patientId, status, page = 1, limit = 10 } = req.query;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const query: any = { doctorId: doctor._id };
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    const reports = await LabReport.find(query)
      .populate("patientId", "name email")
      .sort({ reportDate: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await LabReport.countDocuments(query);

    res.json({ reports, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getLabReportById = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { user } = req;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const report = await LabReport.findOne({
      _id: reportId,
      doctorId: doctor._id,
    }).populate("patientId");

    if (!report) {
      return res.status(404).json({ error: "Lab report not found" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const uploadLabReport = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { patientId, testName, testDescription, results, fileUrl, appointmentId } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const report = new LabReport({
      doctorId: doctor._id,
      patientId,
      appointmentId,
      testName,
      testDescription,
      results,
      fileUrl,
      status: "completed",
    });

    await report.save();

    res.status(201).json({ message: "Lab report uploaded", report });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const addLabReportNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const { user } = req;
    const { doctorNotes } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const report = await LabReport.findOneAndUpdate(
      { _id: reportId, doctorId: doctor._id },
      {
        doctorNotes,
        status: "reviewed",
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: "Lab report not found" });
    }

    res.json({ message: "Notes added to lab report", report });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
