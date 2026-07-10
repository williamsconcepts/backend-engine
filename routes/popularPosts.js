import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middlewares/auth.js";
const app = Router();

app.get("/posts/popular", async (req, res) => {
  try {
    const posts = await db("posts")
      .orderBy(
        "likes",

        "desc",
      )

      .limit(3);

    res.json(posts);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed loading popular posts",
    });
  }
});

export default app;
