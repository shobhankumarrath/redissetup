import "../config/env.js";
import { Worker } from "bullmq";
import fs from "fs/promises";
import path from "path";
import redisClient from "../redis/client.js";
import { File } from "../repo/models/file.js";
import { TTL_CONFIG } from "../config/ttl.config.js";

await redisClient.connect();
console.log("Worker Redis connected");
const processedDir = path.join(process.cwd(), "processed");
await fs.mkdir(processedDir, { recursive: true });

new Worker(
  "filequeue",
  async (job) => {
    try {
      const { path: filePath, originalName, storedName } = job.data;
      console.log("Processing:", originalName);

      await File.update(
        { status: "PROCESSING" },
        { where: { stored_name: storedName } }
      );
      //simulate heavy work
      await new Promise((res) => setTimeout(res, 2000));

      const newPath = path.join(processedDir, storedName);
      await fs.rename(filePath, newPath);

      await File.update(
        {
          status: "completed",
        },
        { where: { stored_name: storedName } }
      );
      await redisClient.setEx(
        `file:cleanup:${storedName}`,
        TTL_CONFIG.FILE_CLEANUP_SECONDS,
        JSON.stringify({ storedName })
      );

      console.log("Completed:", storedName);
      console.log("TTL set for cleanup:", storedName);
    } catch (error) {
      console.error("❌ Worker failed:", error);
      throw error;
    }
  },
  {
    connection: {
      url: process.env.REDIS_URL,
    },
  }
);
