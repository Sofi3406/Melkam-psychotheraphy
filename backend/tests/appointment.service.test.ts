import { AppointmentService } from "../src/services/appointment.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const service = new AppointmentService();

describe("AppointmentService", () => {
  let patientId: string;
  let therapistId: string;

  beforeAll(async () => {
    await prisma.appointment.deleteMany();
    await prisma.availabilitySlot.deleteMany();
    await prisma.user.deleteMany();

    const patient = await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "Patient",
        email: "patient@test.com",
        password: "pass",
        role: "PATIENT",
      },
    });
    const therapist = await prisma.user.create({
      data: {
        firstName: "Test",
        lastName: "Therapist",
        email: "therapist@test.com",
        password: "pass",
        role: "THERAPIST",
      },
    });

    patientId = patient.id;
    therapistId = therapist.id;

    // Add availability slot: 8AM - 6PM
    await prisma.availabilitySlot.create({
      data: {
        therapistId,
        startsAt: new Date("2025-09-01T08:00:00Z"),
        endsAt: new Date("2025-09-01T18:00:00Z"),
      },
    });
  });

  it("should allow booking when available and no conflict", async () => {
    const appt = await service.bookAppointment(
      patientId,
      therapistId,
      new Date("2025-09-01T09:00:00Z"),
      new Date("2025-09-01T10:00:00Z"),
      "Therapy session"
    );
    expect(appt.status).toBe("SCHEDULED");
  });

  it("should prevent booking when conflict exists", async () => {
    await expect(
      service.bookAppointment(
        patientId,
        therapistId,
        new Date("2025-09-01T09:30:00Z"), // overlaps
        new Date("2025-09-01T10:30:00Z"),
        "Overlap test"
      )
    ).rejects.toThrow("Appointment conflicts with existing booking");
  });

  it("should prevent booking outside therapist availability", async () => {
    await expect(
      service.bookAppointment(
        patientId,
        therapistId,
        new Date("2025-09-01T07:00:00Z"), // before availability
        new Date("2025-09-01T08:30:00Z"),
        "Outside hours"
      )
    ).rejects.toThrow("Therapist is not available during this time");
  });
});
