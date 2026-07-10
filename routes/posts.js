import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middlewares/auth.js";
const app = Router();

// create post
app.post("/posts/create", requireAuth, async (req, res) => {
  try {
    const { title, postContent, categoryId } = req.body;
    if (!title || !postContent || !categoryId) {
      return res.status(412).json({
        messaage: "Incomplete post inputs",
      });
    }

    const category = await db("categories")
      .where({
        id: categoryId,
      })
      .first();

    if (!category) {
      return res.status(400).json({
        message: "Category not found",
      });
    }

    await db("posts").insert({
      title,
      postContent,
      categoryId,
      likes: 0,
    });

    res.status(200).json({
      message: "Post created",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to create post",
    });
  }
});

// get posts
app.get("/posts", requireAuth, async (req, res) => {
  try {
    // read the sort from query string and default to desc
    const s = req.query.sort || "desc";

    // query the posts table
    const postQuery = await db("posts")
      .leftJoin("categories", "posts.categoryId", "categories.id")
      .select(
        "posts.id",
        "posts.title",
        "posts.postContent",
        "posts.categoryId",
        "categories.title as category",
        "posts.likes",
        "posts.created_at",
      )
      .orderBy("posts.created_at", s);

    // create an empty object to group post by their id
    // create an empty array to store the unsorted values
    const posts = {};
    const order = [];
    // loop over each post, if the post Id has not been added yet, create a post object and
    // initialize comments as an empty array

    for (const post of postQuery) {
      if (!posts[post.id]) {
        posts[post.id] = {
          id: post.id,
          title: post.title,
          postContent: post.postContent,
          categoryId: post.categoryId,
          category: post.category,
          likes: post.likes,
          created_at: post.created_at,
          comments: [],
        };
        // store the result in order
        order.push(post.id);
      }

      // get the latest comments, orderBy Id and limit by 2
      const latestComments = await db("comments")
        .where({ postId: post.id })
        .orderBy("id", "desc")
        .limit(5);

      // if the current post includes a comment, add it to that post's comments array
      for (const comment of latestComments) {
        posts[post.id].comments.push({
          id: comment.id,
          comment: comment.comment,
          userName: comment.userName,
        });
      }
    }

    // run a callback on each posts item in our order and store in a variable called ordered
    const ordered = order.map((item) => posts[item]);

    // return ordered
    return res.json(ordered);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to load posts",
    });
  }
});

// delete posts if comments < 1
app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const post = await db("posts").where({ id }).first();

    if (!post) {
      return res.status(421).json({
        message: "post not found",
      });
    }

    const comments = await db("comments")
      .where({ postId: id })
      .count("* as total")
      .first();

    if (Number(comments.total) >= 1) {
      return res.status(421).json({
        message: "post has more than 1 comment",
      });
    }

    await db("comments").where({ postId: id }).delete();
    await db("posts").where({ id }).delete();

    return res.status(200).json({
      message: "post deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to delete post",
    });
  }
});

// popular posts
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

// likes
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
