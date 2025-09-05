import { Worker } from "bullmq";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const worker = new Worker(
  "meet-queue",
  async (job) => {
    console.log(`⚡ Processing job ${job.name}`, job.data);

    if (job.name === "create-meet") {
      const { appointmentId } = job.data;

      // 👉 Here you could call Google Meet / Zoom API
      const meetLink = `https://meet.example.com/${appointmentId}`;

      // Update appointment with meet link
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { meetLink },
      });

      console.log(`✅ Meet link added for appointment ${appointmentId}`);
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "redis",
      port: 6379,
      maxRetriesPerRequest: null,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});
