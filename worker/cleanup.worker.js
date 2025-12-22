import "../config/env.js";
import fs from "fs";
import path from "path";
import { createClient } from "redis";
import { File } from "../repo/models/file.js";

const redis = createClient();
await redis.connect();

console.log("Cleanup worker running..");

await redis.configSet("notify-keyspace-events", "Ex");

const subscriber = redis.duplicate();
await subscriber.connect();

subscriber.subscribe("__keyevent@0__:expired", async (key) => {
  if (!key.startsWith("file:cleanup:")) return;

  const storedName = key.replace("file:cleanup:", "");
  const filePath = path.join(process.cwd(), "processed", storedName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("Auto-deleted File", storedName);
  }

  await File.update(
    { status: "deleted" },
    { where: { stored_name: storedName } }
  );
});
