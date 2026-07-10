import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middlewares/auth.js";
const app = Router();

// create category
app.post("/category/create", requireAuth, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(421).json({
        message: "Category title required",
      });
    }

    await db("categories").insert({
      title,
    });
    res.status(200).json({
      message: "Category created",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to create category",
    });
  }
});

// get categories
app.get("/categories", requireAuth, async (req, res) => {
  try {
    const categories = await db("categories");

    res.json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to load categories",
    });
  }
});

// delete category that has no post assigned to it
app.delete("/category/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const category = await db("categories")
      .where({
        id,
      })
      .first();

    if (!category) {
      return res.status(421).json({
        message: "category not found",
      });
    }

    const posts = await db("posts")
      .where({
        categoryId: id,
      })
      .count("* as total")
      .first();

    if (Number(posts.total) > 0) {
      return res.status(421).json({
        message: "Category has posts assigned to it",
      });
    }

    const cat = await db("categories")
      .where({
        id: id,
      })
      .delete();

    return res.status(200).json({
      message: "category deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to Delete category",
    });
  }
});

export default app;
