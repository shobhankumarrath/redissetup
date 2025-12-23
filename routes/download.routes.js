import express from "express";
import crypto from "crypto";
import { createClient } from "redis";
import path from "path";
import fs from "fs";
import { TTL_CONFIG } from "../config/ttl.config.js";

const router = express.Router();
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

await redisClient.connect();

//Generate secure download link

router.post("/generate-download", async (req, res) => {
  const { storedName } = req.body;

  if (!storedName) {
    return res.status(400).json({ error: "storedName is required" });
  }
  const token = crypto.randomUUID();
  const redisKey = `download:${token}`;

  //TTL = 5 minutes

  await redisClient.setEx(
    redisKey,
    TTL_CONFIG.DOWNLOAD_LINK_SECONDS,
    JSON.stringify({ storedName })
  );
  const BASE_URL = process.env.BASE_URL;
  res.json({
    downloadUrl: `${BASE_URL}/api/download/${token}`,
    expiresIn: "5 minutes",
  });
});

//Download file using token
router.get("/download/:token", async (req, res) => {
  const { token } = req.params;

  const data = await redisClient.get(`download:${token}`);
  if (!data) {
    return res.status(410).json({ error: "Link expired or invalid" });
  }
  const { storedName } = JSON.parse(data);
  const filePath = path.join(process.cwd(), "processed", storedName);
  console.log(filePath);

  if (fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath);
});

export default router;
