import request from "supertest";
import app from "../src/index";
import prisma from "../src/prismaClient";

describe("Appointment Controller", () => {
  let patient: any;
  let therapist: any;
  let appointmentId: string;

  beforeAll(async () => {
    // Clean DB in correct order
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
    const res = await request(app).get("/appointments");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("GET /appointments/:id → should return one appointment", async () => {
    const res = await request(app).get(`/appointments/${appointmentId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(appointmentId);
  });

  it("PUT /appointments/:id → should update appointment", async () => {
    const res = await request(app)
      .put(`/appointments/${appointmentId}`)
      .send({
        notes: "Updated by controller test",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notes).toBe("Updated by controller test");
  });

  it("DELETE /appointments/:id → should delete appointment", async () => {
    const res = await request(app).delete(`/appointments/${appointmentId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Confirm deletion
    const check = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });
    expect(check).toBeNull();
  });
});
