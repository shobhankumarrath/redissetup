import express from "express";
import multer from "multer";
import { File } from "../repo/models/file.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { uploadRateLimiter } from "../middleware/uploadRateLimit.middleware.js";
import { filequeue } from "../redis/queue.js";
import { sequelize } from "../db/sequelize.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  authMiddleware,
  uploadRateLimiter,
  upload.single("file"),
  async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
      if (!req.file) {
        await transaction.rollback();
        return res.status(400).json({ error: "No file uploaded" });
      }

      await File.create(
        {
          user_id: req.user.id,
          original_name: req.file.originalname,
          stored_name: req.file.filename,
          status: "QUEUED",
        },
        { transaction }
      );

      await filequeue.add("process-file", {
        path: req.file.path,
        originalName: req.file.originalname,
        storedName: req.file.filename,
      });

      await transaction.commit();

      res.json({
        message: "File uploaded successfully and queued for processing",
        filename: req.file.originalname,
        storedAs: req.file.filename, // API-friendly naming
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Upload Failed:", error);
      res.status(500).json({ error: "Upload Failed" });
    }
  }
);

export default router;
