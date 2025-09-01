import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/index";
import prisma from "../src/prismaClient";

describe("Appointment Routes with Auth", () => {
  let patient: any;
  let therapist: any;
  let tokenPatient: string;
  let tokenTherapist: string;

  beforeAll(async () => {
    // cleanup in order
    await prisma.appointment.deleteMany();
    await prisma.availabilitySlot.deleteMany();
    await prisma.user.deleteMany();

    // create patient
    patient = await prisma.user.create({
      data: {
        firstName: "Sofi",
        lastName: "Yasin",
        email: "sofi@example.com",
        password: "hashed-password",
        role: "PATIENT",
      },
    });

    // create therapist
    therapist = await prisma.user.create({
      data: {
        firstName: "Dr",
        lastName: "Shikur",
        email: "shikur@example.com",
        password: "hashed-password",
        role: "THERAPIST",
      },
    });

    // sign JWTs
    tokenPatient = jwt.sign(
      { id: patient.id, role: "PATIENT" },
      process.env.JWT_SECRET || "test-secret"
    );

    tokenTherapist = jwt.sign(
      { id: therapist.id, role: "THERAPIST" },
      process.env.JWT_SECRET || "test-secret"
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("✅ allows patient to create appointment for themselves", async () => {
    const res = await request(app)
      .post("/appointments")
      .set("Authorization", `Bearer ${tokenPatient}`)
      .send({
        patientId: patient.id,
        therapistId: therapist.id,
        startsAt: "2025-10-01T09:00:00.000Z",
        endsAt: "2025-10-01T10:00:00.000Z",
        notes: "Patient self booking",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patientId).toBe(patient.id);
  });

  it("❌ blocks patient from creating appointment for another patient", async () => {
    const fakePatientId = "some-other-id";

    const res = await request(app)
      .post("/appointments")
      .set("Authorization", `Bearer ${tokenPatient}`)
      .send({
        patientId: fakePatientId, // mismatched ID
        therapistId: therapist.id,
        startsAt: "2025-10-02T09:00:00.000Z",
        endsAt: "2025-10-02T10:00:00.000Z",
        notes: "Should not be allowed",
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Patients can only create appointments/);
  });

  it("✅ allows therapist to create appointment for any patient", async () => {
    const res = await request(app)
      .post("/appointments")
      .set("Authorization", `Bearer ${tokenTherapist}`)
      .send({
        patientId: patient.id,
        therapistId: therapist.id,
        startsAt: "2025-10-03T09:00:00.000Z",
        endsAt: "2025-10-03T10:00:00.000Z",
        notes: "Therapist booking",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patientId).toBe(patient.id);
  });
});
