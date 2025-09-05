import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/index";
import prisma from "../src/prismaClient";

describe("Booking Flow Integration", () => {
  let patient: any;
  let therapist: any;
  let patientToken: string;

  beforeAll(async () => {
    // Clean DB
    await prisma.appointment.deleteMany();
    await prisma.availabilitySlot.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    patient = await prisma.user.create({
      data: {
        firstName: "Sofi",
        lastName: "Yasin",
        email: "sofi@test.com",
        password: "hashedpass",
        role: "PATIENT",
      },
    });

    therapist = await prisma.user.create({
      data: {
        firstName: "Dr",
        lastName: "Shikur",
        email: "shikur@test.com",
        password: "hashedpass",
        role: "THERAPIST",
      },
    });

    // Add therapist availability slot
    await prisma.availabilitySlot.create({
      data: {
        therapistId: therapist.id,
        startsAt: new Date("2025-09-01T08:00:00Z"),
        endsAt: new Date("2025-09-01T18:00:00Z"),
      },
    });

    // Sign JWT for patient
    patientToken = jwt.sign(
      { id: patient.id, role: "PATIENT" },
      process.env.JWT_SECRET as string
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should book an appointment and persist in DB", async () => {
    const payload = {
  patientId: patient.id,
  therapistId: therapist.id,
  startsAt: "2025-09-01T09:00:00.000Z", 
  endsAt: "2025-09-01T10:00:00.000Z",
  notes: "Integration test booking",
};


    const res = await request(app)
      .post("/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();

    // confirm DB persistence
    const found = await prisma.appointment.findUnique({
      where: { id: res.body.data.id },
    });
    expect(found).not.toBeNull();
    expect(found?.notes).toBe("Integration test booking");
  });
});
