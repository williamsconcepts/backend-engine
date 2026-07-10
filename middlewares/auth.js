import db from "../db.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Find the user with this access token
    const user = await db("users")
      .where({
        accessToken: token,
      })
      .first();

    if (!user) {
      return res.status(401).json({
        message: "Invalid access token",
      });
    }

    // Attach the authenticated user to the request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Authentication failed",
    });
  }
};
