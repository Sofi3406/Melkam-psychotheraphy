import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const connection = new IORedis(process.env.REDIS_URL || "redis://redis:6379");

// Define a queue
const exampleQueue = new Queue("exampleQueue", { connection });

// Worker that processes jobs
const worker = new Worker(
  "exampleQueue",
  async (job) => {
    console.log(`⚡ Processing job ${job.id} with data:`, job.data);
    return { result: "done" };
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

// Add a test job when worker boots
(async () => {
  await exampleQueue.add("testJob", { foo: "bar" });
})();
