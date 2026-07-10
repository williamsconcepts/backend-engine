import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middlewares/auth.js";
const app = Router();

app.patch("/posts/:id/like", async (req, res) => {
  try {
    const { id } = req.params;

    const post = await db("posts")
      .where({
        id,
      })

      .first();

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    await db("posts")
      .where({
        id,
      })

      .increment(
        "likes",

        1,
      );

    res.json({
      message: "Post liked",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed liking post",
    });
  }
});

export default app;
