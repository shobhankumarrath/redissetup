import { Queue } from "bullmq";
export const filequeue = new Queue("filequeue", {
  connection: {
    url: process.env.REDIS_URL,
  },
});
