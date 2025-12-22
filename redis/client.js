import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.RedisUrl || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
};

export default redisClient;
