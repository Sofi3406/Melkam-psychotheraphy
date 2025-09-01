import { appointmentRepository } from "../src/repositories/appointment.repository";
import { PrismaClient, AppointmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Running appointment.repository tests...");

  // ⚡ Create two dummy users (therapist & patient)
  const patient = await prisma.user.create({
    data: {
      firstName: "Sofiya",
      lastName: "Yasin",
      email: "sofiyasin190@gmail.com",
      password: "hashed-password",
      role: "PATIENT",
    },
  });

  const therapist = await prisma.user.create({
    data: {
      firstName: "Dr.",
      lastName: "Shikur",
      email: "shikuryasin@gmail.com",
      password: "hashed-password",
      role: "THERAPIST",
    },
  });

  console.log("✅ Dummy users created:", { patient, therapist });

  // ⚡ Create an appointment
  const appointment = await appointmentRepository.create({
    patientId: patient.id,
    therapistId: therapist.id,
    startsAt: new Date("2025-09-01T10:00:00.000Z"),
    endsAt: new Date("2025-09-01T11:00:00.000Z"),
    notes: "First consultation",
  });

  console.log("✅ Appointment created:", appointment);

  // ⚡ Find by ID
  const found = await appointmentRepository.findById(appointment.id);
  console.log("🔍 Found appointment:", found);

  // ⚡ List by user
  const userAppointments = await appointmentRepository.listByUser(patient.id);
  console.log("📋 Appointments for patient:", userAppointments);

  // ⚡ List by therapist & range
  const therapistAppointments = await appointmentRepository.listByTherapistAndRange(
    therapist.id,
    new Date("2025-09-01T00:00:00.000Z"),
    new Date("2025-09-02T00:00:00.000Z")
  );
  console.log("📅 Therapist appointments on Sept 1:", therapistAppointments);

  // ⚡ Conflict check (should be true if we try same time)
  const hasConflict = await appointmentRepository.checkConflicts(
    therapist.id,
    new Date("2025-09-01T10:30:00.000Z"),
    new Date("2025-09-01T11:30:00.000Z")
  );
  console.log("⚠️ Conflict exists?", hasConflict);

  // ⚡ Update appointment
  const updated = await appointmentRepository.update(appointment.id, {
    status: AppointmentStatus.SCHEDULED,
    meetLink: "https://meet.example.com/session-123",
  });
  console.log("✏️ Updated appointment:", updated);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
