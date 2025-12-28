import "../config/env.js";
import { Worker } from "bullmq";
import fs from "fs/promises";
import path from "path";
import redisClient from "../redis/client.js";
import { File } from "../repo/models/file.js";
import { TTL_CONFIG } from "../config/ttl.config.js";
import { supabase } from "../lib/supabase.js";
import { Queue } from "bullmq";

await redisClient.connect();

const cleanupQueue = new Queue("cleanupqueue", {
  connection: { url: process.env.REDIS_URL },
});
console.log("Worker Redis connected");
const processedDir = path.join(process.cwd(), "processed");
await fs.mkdir(processedDir, { recursive: true });

new Worker(
  "filequeue",
  async (job) => {
    try {
      const { path, storedName, originalName, mimeType } = job.data;
      console.log("Processing:", originalName);

      await File.update(
        { status: "PROCESSING" },
        { where: { stored_name: storedName } }
      );

      // await scanForVirus(path);

      const buffer = await fs.readFile(path);
      const { error } = await supabase.storage
        .from("uploads")
        .upload(storedName, buffer, { contentType: mimeType, upsert: false });

      if (error) throw error;
      await File.update(
        { status: "Completed" },
        { where: { stored_name: storedName } }
      );

      await cleanupQueue.add(
        "cleanup",
        { storedName },
        { delay: TTL_CONFIG.FILE_CLEANUP_SECONDS }
      );

      console.log("Uploaded and Secured");
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
