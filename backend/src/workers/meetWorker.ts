import { Worker } from "bullmq";
import prisma from "../prismaClient";

const connection = { connection: { host: "redis", port: 6379 } };

// Worker that listens for jobs on "meetQueue"
const worker = new Worker(
  "meetQueue",
  async job => {
    const { appointmentId } = job.data;

    // Simulate external Meet API (stub for now)
    const meetLink = `https://meet.example.com/${appointmentId}`;

    // Update appointment with meetLink
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { meetLink },
    });

    console.log(`✅ Meet link created for appointment ${appointmentId}`);
  },
  connection
);

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});
