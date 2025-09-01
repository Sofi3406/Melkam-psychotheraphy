import { Request, Response } from "express";
import { AppointmentService } from "../services/appointment.service";

const service = new AppointmentService();

export async function createAppointment(req: Request, res: Response) {
  try {
    const { patientId, therapistId, startsAt, endsAt, notes } = req.body;
    const appointment = await service.bookAppointment(
      patientId,
      therapistId,
      new Date(startsAt),
      new Date(endsAt),
      notes
    );
    res.status(201).json({ success: true, data: appointment });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getAppointments(_req: Request, res: Response) {
  const appointments = await service.listAppointments();
  res.json({ success: true, data: appointments });
}

export async function getAppointment(req: Request, res: Response) {
  const appt = await service.getAppointmentById(req.params.id);
  if (!appt) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  res.json({ success: true, data: appt });
}

export async function updateAppointment(req: Request, res: Response) {
  try {
    const updated = await service.updateAppointment(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function deleteAppointment(req: Request, res: Response) {
  try {
    await service.deleteAppointment(req.params.id);
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
