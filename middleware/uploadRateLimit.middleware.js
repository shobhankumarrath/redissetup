import redisClient from "../redis/client.js";

export const uploadRateLimiter = async (req, res, next) => {
  const userId = req.user.id;
  const key = `upload_rate:${userId}`;

  //increment request counter
  const count = await redisClient.incr(key, 60);
  //set expiry on 1st request
  if (count === 1) {
    await redisClient.expire(key, 60);
  }

  if (count > 3) {
    return res.status(429).json({
      error: "Upload Limit exceeded. try again later",
    });
  }

  next();
};
