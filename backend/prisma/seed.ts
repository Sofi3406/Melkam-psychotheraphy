import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Create a patient
  const patient = await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "Patient",
      email: "patient@example.com",
      password: "password123", // or hash later
      role: Role.PATIENT,
    },
  });

  // Create a therapist
  const therapist = await prisma.user.create({
    data: {
      firstName: "Dr.",
      lastName: "Therapist",
      email: "therapist@example.com",
      password: "password123", // or hash later
      role: Role.THERAPIST,
    },
  });

  // Add therapist availability
  await prisma.availabilitySlot.create({
    data: {
      therapistId: therapist.id,
      startsAt: new Date("2025-09-03T09:00:00.000Z"),
      endsAt: new Date("2025-09-03T17:00:00.000Z"),
    },
  });

  console.log("✅ Seed complete:", { patient, therapist });
}

main().finally(async () => {
  await prisma.$disconnect();
});
