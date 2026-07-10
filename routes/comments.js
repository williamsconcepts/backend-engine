import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middlewares/auth.js";
const app = Router();

// create comment
app.post("/comment/create", requireAuth, async (req, res) => {
  const { postId, comment, userName } = req.body;

  if (!postId || !comment || !userName)
    return res.status(421).json({
      message: "some fields are missing",
    });

  const post = await db("posts").where({ id: postId }).first();

  if (!post)
    return res.status(421).json({
      message: "invalid post ID",
    });

  await db("comments").insert({
    comment,
    postId,
    userName,
  });

  return res.status(200).json({
    message: "comment posted",
  });
});

export default app;
