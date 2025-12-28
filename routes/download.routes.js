import express from "express";
import crypto from "crypto";
import redisClient from "../redis/client.js";
import { File } from "../repo/models/file.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

//Generate link api
router.post("/generate-download", async (req, res) => {
  const { storedName } = req.body;

  const token = crypto.randomUUID();
  await redisClient.setEx(
    `download:${token}`,
    200,
    JSON.stringify({ storedName })
  );
  res.json({
    downloadUrl: `${process.env.BASE_URL}/api/download/${token}`,
    expires: "In 3 minutes",
  });
});

router.get("/download/:token", async (req, res) => {
  const data = await redisClient.get(`download:${req.params.token}`);
  if (!data) {
    return res.status(410).json({ error: "Link Expired" });
  }

  const { storedName } = JSON.parse(data);

  const fileRecord = await File.findOne({
    where: { stored_name: storedName },
  });

  if (!fileRecord) {
    return res.status(404).json({ error: "Metadata missing" });
  }

  const { data: file, error } = await supabase.storage
    .from("uploads")
    .download(storedName);

  if (error || !file) {
    return res.status(404).json({ error: "File not found in storage" });
  }

  res.set({
    "Content-Disposition": `attachment; filename="${fileRecord.original_name}"`,
    "Content-Type": fileRecord.mime_type,
  });

  res.send(Buffer.from(await file.arrayBuffer()));
});

export default router;
