// tests/appointment.controller.test.ts
import request from "supertest";
import app from "../src/index";
import prisma from "../src/prismaClient";
import jwt from "jsonwebtoken";

describe("Appointment Controller", () => {
  let patient: any;
  let therapist: any;
  let appointmentId: string;
  let token: string;

  beforeAll(async () => {
    // Clean DB in the correct order
    await prisma.appointment.deleteMany();
    await prisma.availabilitySlot.deleteMany();
    await prisma.user.deleteMany();

    // Create dummy users
    patient = await prisma.user.create({
      data: {
        firstName: "Sofi",
        lastName: "Yasin",
        email: "sofi@example.com",
        password: "hashed-password",
        role: "PATIENT",
      },
    });

    therapist = await prisma.user.create({
      data: {
        firstName: "Dr",
        lastName: "Shikur",
        email: "shikur@example.com",
        password: "hashed-password",
        role: "THERAPIST",
      },
    });

    // Create availability slot AFTER therapist exists
    await prisma.availabilitySlot.create({
      data: {
        therapistId: therapist.id,
        startsAt: new Date("2025-09-01T08:00:00Z"),
        endsAt: new Date("2025-09-01T18:00:00Z"),
      },
    });

    // Generate JWT for patient
    token = jwt.sign(
      { id: patient.id, role: "PATIENT" },
      process.env.JWT_SECRET || "secret", // fallback so tests don’t crash
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    // Clean everything after tests
    await prisma.appointment.deleteMany();
    await prisma.availabilitySlot.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("POST /appointments → should create an appointment", async () => {
    const res = await request(app)
      .post("/appointments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        patientId: patient.id,
        therapistId: therapist.id,
        startsAt: "2025-09-01T09:00:00.000Z",
        endsAt: "2025-09-01T10:00:00.000Z",
        notes: "Controller test booking",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();

    appointmentId = res.body.data.id;
  });

  it("GET /appointments → should return list of appointments", async () => {
    const res = await request(app)
      .get("/appointments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("GET /appointments/:id → should return one appointment", async () => {
    const res = await request(app)
      .get(`/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(appointmentId);
  });

  it("PUT /appointments/:id → should update appointment", async () => {
    const res = await request(app)
      .put(`/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        notes: "Updated by controller test",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notes).toBe("Updated by controller test");
  });

  it("DELETE /appointments/:id → should delete appointment", async () => {
    const res = await request(app)
      .delete(`/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Confirm deletion
    const check = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    expect(check).toBeNull();
  });
});
