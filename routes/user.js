import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middlewares/auth.js";

const app = Router();

/**
 * Register User
 */
app.post("/user/create", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await db("users").where({ email }).first();

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const accessToken = btoa(
      JSON.stringify({
        email,
        name,
        password: btoa(password),
      }),
    );

    await db("users").insert({
      name,
      email,
      password: btoa(password),
      accessToken,
    });

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to register user",
    });
  }
});

/**
 * Login
 */
app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db("users").where({ email }).first();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.password !== btoa(password)) {
      return res.status(401).json({
        message: "Incorrect password",
      });
    }

    return res.json({
      message: "Logged in successfully",

      accessToken: user.accessToken,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to login",
    });
  }
});

/**
 * Get All Users
 */
app.get("/users", requireAuth, async (req, res) => {
  try {
    const users = await db("users").select(
      "id",
      "name",
      "email",
      "role",
      "created_at",
    );

    return res.json(users);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to load users",
    });
  }
});

export default app;
