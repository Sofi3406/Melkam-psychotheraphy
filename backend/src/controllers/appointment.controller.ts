import { Request, Response } from "express";
import { AppointmentService } from "../services/appointment.service";
import { meetQueue } from "../queues/meet.queue";  // ✅ import the queue

const service = new AppointmentService();

// Create appointment + enqueue meet creation job
export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appt = await service.bookAppointment(
      req.body.patientId,
      req.body.therapistId,
      new Date(req.body.startsAt),
      new Date(req.body.endsAt),
      req.body.notes
    );

    // ✅ enqueue meet creation job
    await meetQueue.add("create-meet", { appointmentId: appt.id });

    res.status(201).json({ success: true, data: appt });
  } catch (err: any) {
    console.error("❌ Appointment creation failed:", err.message);
    res.status(400).json({ success: false, error: err.message });
  }
};

// List all appointments
export const listAppointments = async (_req: Request, res: Response) => {
  try {
    const appointments = await service.listAppointments();
    res.json({ success: true, data: appointments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appt = await service.getAppointmentById(req.params.id);
    res.json({ success: true, data: appt });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
};

// Update appointment
export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const updated = await service.updateAppointment(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete appointment
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    await service.deleteAppointment(req.params.id);
    res.json({ success: true, message: "Appointment deleted" });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
