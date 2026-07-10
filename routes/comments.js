import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middlewares/auth.js";

const app = Router();

/**
 * Create Comment
 */
app.post("/comment/create", requireAuth, async (req, res) => {
  try {
    const { postId, comment } = req.body;

    if (!postId || !comment) {
      return res.status(400).json({
        message: "Post ID and comment are required",
      });
    }

    const post = await db("posts").where({ id: postId }).first();

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    await db("comments").insert({
      postId,
      comment,
      userId: req.user.id,
    });

    return res.status(201).json({
      message: "Comment posted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to post comment",
    });
  }
});

/**
 * Get Comments For A Post
 */
app.get("/posts/:id/comments", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await db("comments")
      .leftJoin("users", "comments.userId", "users.id")
      .where({
        postId: id,
      })
      .select(
        "comments.id",
        "comments.comment",
        "comments.created_at",
        "users.id as userId",
        "users.name as userName",
      )
      .orderBy("comments.created_at", "desc");

    return res.json(comments);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to load comments",
    });
  }
});

export default app;
