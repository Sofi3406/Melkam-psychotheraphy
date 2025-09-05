import { Queue } from "bullmq";

export const meetQueue = new Queue("meet-queue", {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: 6379,
    maxRetriesPerRequest: null,
  },
});
