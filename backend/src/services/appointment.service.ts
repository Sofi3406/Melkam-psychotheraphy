import { AppointmentRepository } from "../repositories/appointment.repository";
import prisma from "../prismaClient";

import { AppointmentStatus } from "@prisma/client";

export class AppointmentService {
  private repo: AppointmentRepository;

  constructor() {
    this.repo = new AppointmentRepository();
  }

  async bookAppointment(
    patientId: string,
    therapistId: string,
    startsAt: Date,
    endsAt: Date,
    notes?: string
  ) {
    const conflict = await this.repo.checkConflicts(therapistId, startsAt, endsAt);
    if (conflict) throw new Error("Conflict detected with another appointment");

    return this.repo.create({
      patientId,
      therapistId,
      startsAt,
      endsAt,
      notes,
      status: AppointmentStatus.SCHEDULED,
    });
  }

  

  async listAppointments() {
    return prisma.appointment.findMany();
  }

  async getAppointmentById(id: string) {
    return prisma.appointment.findUnique({ where: { id } });
  }

  async updateAppointment(id: string, data: any) {
    return prisma.appointment.update({
      where: { id },
      data,
    });
  }

  async deleteAppointment(id: string) {
    return prisma.appointment.delete({ where: { id } });
  }
}
