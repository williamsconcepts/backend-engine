import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../middlewares/auth.js";
const app = Router();

app.post("/user/create", async (req, res) => {
  const body = req.body;

  if (!body.email || !body.password || !body.name) {
    return res.status(421).json({
      message: "Email and Password required",
    });
  }

  const users = btoa(
    JSON.stringify({
      email: body.email,
      name: body.name,
      password: btoa(body.password),
    }),
  );

  await db("users").insert({
    email: body.email,
    name: body.name,
    password: btoa(body.password),
    accessToken: btoa(
      JSON.stringify({
        email: body.email,
        name: body.name,
        password: btoa(body.password),
      }),
    ),
  });
  return res.json({
    message: "User has been registered",
  });
});

app.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db("users")
      .where({
        email,
      })
      .first();

    if (!user) {
      return res.status(421).json({
        message: "User not found",
      });
    }

    if (user.password !== btoa(password)) {
      return res.status(421).json({
        message: "Password Incorrect",
      });
    }

    return res.status(200).json({
      message: "Logged in successfully",
      accessToken: user.accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to log user in",
    });
  }
});

// get users
app.get("/users", requireAuth, async (req, res) => {
  try {
    const users = await db("users").select("id", "email", "password");

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to load users",
    });
  }
});

export default app;
