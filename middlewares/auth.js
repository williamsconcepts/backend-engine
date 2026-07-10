import db from "../db.js";

export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const payload = JSON.parse(atob(token));

    const user = await db("users").where({ email: payload.email }).first();

    if (!user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};
