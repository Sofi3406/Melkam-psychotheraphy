import { PrismaClient, Appointment, AppointmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

export class AppointmentRepository {
  // Create new appointment
async create(data: {
  patientId: string;
  therapistId: string;
  startsAt: Date;
  endsAt: Date;
  notes?: string;
  status?: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELLED"; 
}) {
  return prisma.appointment.create({ data });
}


  // Find appointment by ID
  async findById(id: string): Promise<Appointment | null> {
    return prisma.appointment.findUnique({
      where: { id },
    });
  }

  // List all appointments for a user (as patient or therapist)
  async listByUser(userId: string): Promise<Appointment[]> {
    return prisma.appointment.findMany({
      where: {
        OR: [{ patientId: userId }, { therapistId: userId }],
      },
      orderBy: { startsAt: "asc" },
    });
  }

  // List all appointments for a therapist within a time range
  async listByTherapistAndRange(
    therapistId: string,
    start: Date,
    end: Date
  ): Promise<Appointment[]> {
    return prisma.appointment.findMany({
      where: {
        therapistId,
        startsAt: { gte: start },
        endsAt: { lte: end },
      },
      orderBy: { startsAt: "asc" },
    });
  }

  // Check conflicts (overlapping appointments for the same therapist)
  async checkConflicts(
    therapistId: string,
    startsAt: Date,
    endsAt: Date
  ): Promise<boolean> {
    const conflicts = await prisma.appointment.findFirst({
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

    return conflicts !== null;
  }

  // Update appointment status, notes, or meetLink
  async update(
    id: string, 
    data: Partial<{
      status: AppointmentStatus;
      notes: string;
      meetLink: string;
    }>
): Promise<Appointment> {
    return prisma.appointment.update({
        where: { id }, 
        data,
    });

  }

}

export const appointmentRepository = new AppointmentRepository();