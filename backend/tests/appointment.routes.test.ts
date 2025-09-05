import request from "supertest";
import app from "../src/index";
import prisma from "../src/prismaClient";
import jwt from "jsonwebtoken";

describe("Appointment Routes", () => {
  let patient: any;
  let therapist: any;
  let tokenPatient: string;
  let tokenTherapist: string;
  let appointmentId: string;

  beforeAll(async () => {
    await prisma.appointment.deleteMany();
    await prisma.availabilitySlot.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    patient = await prisma.user.create({
      data: {
        firstName: "Route",
        lastName: "Patient",
        email: "route-patient@test.com",
        password: "hashedpass",
        role: "PATIENT",
      },
    });

    therapist = await prisma.user.create({
      data: {
        firstName: "Route",
        lastName: "Therapist",
        email: "route-therapist@test.com",
        password: "hashedpass",
        role: "THERAPIST",
      },
    });

    // Add availability slot
    await prisma.availabilitySlot.create({
      data: {
        therapistId: therapist.id,
        startsAt: new Date("2025-09-01T08:00:00Z"),
        endsAt: new Date("2025-09-01T18:00:00Z"),
      },
    });

    // Generate tokens
    tokenPatient = jwt.sign(
      { id: patient.id, role: "PATIENT" },
      process.env.JWT_SECRET!
    );
    tokenTherapist = jwt.sign(
      { id: therapist.id, role: "THERAPIST" },
      process.env.JWT_SECRET!
    );
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany();
    await prisma.availabilitySlot.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("POST /appointments → patient can book an appointment", async () => {
    const res = await request(app)
      .post("/appointments")
      .set("Authorization", `Bearer ${tokenPatient}`)
      .send({
        patientId: patient.id,
        therapistId: therapist.id,
        startsAt: "2025-09-01T09:00:00.000Z",
        endsAt: "2025-09-01T10:00:00.000Z",
        notes: "Route test booking",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patientId).toBe(patient.id);
    appointmentId = res.body.data.id;
  });

  it("GET /appointments → should return list of appointments", async () => {
    const res = await request(app)
      .get("/appointments")
      .set("Authorization", `Bearer ${tokenTherapist}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("GET /appointments/:id → should return one appointment", async () => {
    const res = await request(app)
      .get(`/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${tokenPatient}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.patientId).toBe(patient.id);
  });

  it("PUT /appointments/:id → therapist can update appointment", async () => {
    const res = await request(app)
      .put(`/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${tokenTherapist}`)
      .send({ notes: "Updated by route test" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notes).toBe("Updated by route test");
  });

  it("DELETE /appointments/:id → therapist can delete appointment", async () => {
    const res = await request(app)
      .delete(`/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${tokenTherapist}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Confirm deletion
    const check = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    expect(check).toBeNull();
  });
});
