import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({ host: "redis", port: 6379 });

export const meetQueue = new Queue("meet-creation", { connection });

new Worker("meet-creation", async job => {
  console.log("Processing job:", job.data);
  // stub meet link
  return { meetLink: `https://meet.stub/${job.data.appointmentId}` };
}, { connection });
