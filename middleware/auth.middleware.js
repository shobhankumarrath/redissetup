export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Mising Authentication Headers" });
  }
  if (token !== "SecretCode1") {
    return res.status(403).json({ error: "Invalid token" });
  }

  req.user = {
    id: "user_1",
  };

  next();
};
