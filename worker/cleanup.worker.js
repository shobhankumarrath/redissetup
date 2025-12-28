import "../config/env.js";
import { Worker } from "bullmq";
import { supabase } from "../lib/supabase.js";
import { File } from "../repo/models/file.js";

new Worker(
  "cleanupqueue",
  async (job) => {
    const { storedName } = job.data;
    try {
      console.log("Cleaning:", storedName);
      await supabase.storage.from("uploads").remove([storedName]);

      await File.update(
        { status: "Deleted" },
        { where: { stored_name: storedName } }
      );
      console.log("Cleaned", storedName);
    } catch (error) {
      console.error("❌ Cleanup failed:", error);
      throw error;
    }
  },
  {
    connection: {
      url: process.env.REDIS_URL,
    },
  }
);
