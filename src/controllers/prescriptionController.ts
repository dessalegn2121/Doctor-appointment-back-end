import { Request, Response } from "express";
import Prescription from "../models/Prescription";
import Doctor from "../models/Doctor";

interface AuthRequest extends Request {
  user?: any;
}

export const getPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const { user } = req;
    const { patientId, page = 1, limit = 10 } = req.query;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const query: any = { doctorId: doctor._id };
    if (patientId) query.patientId = patientId;

    const prescriptions = await Prescription.find(query)
      .populate("patientId", "name email")
      .sort({ issueDate: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Prescription.countDocuments(query);

    res.json({ prescriptions, total, page, limit });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPrescriptionById = async (req: AuthRequest, res: Response) => {
  try {
    const { prescriptionId } = req.params;
    const { user } = req;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      doctorId: doctor._id,
    }).populate("patientId");

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updatePrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { prescriptionId } = req.params;
    const { user } = req;
    const { medicines, diagnosis, notes, status } = req.body;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const prescription = await Prescription.findOneAndUpdate(
      { _id: prescriptionId, doctorId: doctor._id },
      { medicines, diagnosis, notes, status },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    res.json({ message: "Prescription updated", prescription });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const downloadPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { prescriptionId } = req.params;
    const { user } = req;

    const doctor = await Doctor.findOne({ userId: user._id });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      doctorId: doctor._id,
    }).populate("patientId");

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    // Generate PDF in production (use pdfkit or similar)
    res.json({
      prescription,
      message: "PDF generation would be implemented here",
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
