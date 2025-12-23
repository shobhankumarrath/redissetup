import "./config/env.js";

import express from "express";
import { connectRedis } from "./redis/client.js";
import uploadRoutes from "./routes/uploads.route.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import { sequelize } from "./db/sequelize.js";
import downloadRoutes from "./routes/download.routes.js";

const app = express();
app.use(express.json());
app.use("/api", uploadRoutes);
app.use("/api", downloadRoutes);

//healthapi
app.get("/api/health", authMiddleware, (req, res) => {
  return res.status(200).json({ status: "ok", message: "server running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);

const startServer = async () => {
  try {
    await connectRedis();

    await sequelize.authenticate();
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on the port ${PORT}`);
    });
  } catch (error) {
    console.error("start up error", error);
    process.exit(1);
  }
};

startServer();
