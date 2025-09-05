// src/services/appointment.service.ts
import { PrismaClient, Appointment } from "@prisma/client";

const prisma = new PrismaClient();

export class AppointmentService {
  /**
   * Book a new appointment
   */
  async bookAppointment(
    patientId: string,
    therapistId: string,
    startsAt: Date,
    endsAt: Date,
    notes?: string
  ): Promise<Appointment> {
    // 🔍 Check conflicts (overlapping appointment)
    const conflict = await prisma.appointment.findFirst({
      where: {
        therapistId,
        OR: [
          {
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
        ],
      },
    });

    if (conflict) {
      throw new Error("Appointment conflicts with existing booking");
    }

    // 🔍 Check therapist availability
    const availability = await prisma.availabilitySlot.findFirst({
      where: {
        therapistId,
        startsAt: { lte: startsAt },
        endsAt: { gte: endsAt },
      },
    });

    if (!availability) {
      throw new Error("Therapist is not available during this time");
    }

    // ✅ Create appointment
    return prisma.appointment.create({
      data: {
        patientId,
        therapistId,
        startsAt,
        endsAt,
        notes,
        status: "SCHEDULED",
      },
    });
  }

  /**
   * List all appointments
   */
  async listAppointments() {
    return prisma.appointment.findMany({
      include: { patient: true, therapist: true },
      orderBy: { startsAt: "asc" },
    });
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id: string) {
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, therapist: true },
    });
    if (!appt) throw new Error("Appointment not found");
    return appt;
  }

  /**
   * Update appointment
   */
  async updateAppointment(id: string, data: Partial<Appointment>) {
    return prisma.appointment.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete appointment
   */
  async deleteAppointment(id: string) {
    return prisma.appointment.delete({
      where: { id },
    });
  }
}
