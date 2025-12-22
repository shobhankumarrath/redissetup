import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { uploadRateLimiter } from "../middleware/uploadRateLimit.middleware.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post(
  "/upload",
  authMiddleware, //auth first
  uploadRateLimiter, //rate limit
  upload.single("file"), //heavy work last
  (req, res) => {
    res.json({
      message: "File uploaded successfully",
      filename: req.file.originalname,
      storedAs: req.file.filename,
    });
  }
);

export default router;
