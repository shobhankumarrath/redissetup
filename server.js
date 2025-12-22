import express from "express";
import dotenv from "dotenv";
import { connectRedis } from "./redis/client.js";
import uploadRoutes from "./routes/uploads.route.js";
import { authMiddleware } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", uploadRoutes);

//healthapi
app.get("/api/health", authMiddleware, (req, res) => {
  return res.status(200).json({ status: "ok", message: "server running" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`Server running on the port ${PORT}`);
  });
};

startServer();
