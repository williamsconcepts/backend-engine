import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.js";
import postRoutes from "./routes/posts.js";
import categoriesRoutes from "./routes/categories.js";
import commentRoutes from "./routes/comments.js";
import popularRoutes from "./routes/popularPosts.js";
import likeRoutes from "./routes/likes.js";
import { requireAuth } from "./middlewares/auth.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
  next();
});

app.get("/polling", async (req, res) => {
  return res.json({ message: new Date() });
});

app.get("/sse", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendTime = () => {
    const now = new Date();

    res.write(
      `data: ${JSON.stringify({
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
      })}\n\n`,
    );
  };

  // Send immediately
  sendTime();

  // Send every second
  const interval = setInterval(sendTime, 1000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

// Assignment
// connect backend to the frontend(all endpoints)
// use the server set Event(sse) to create a time in the menu bar

app.use("/", userRoutes);
app.use("/", postRoutes);
app.use("/", categoriesRoutes);
app.use("/", commentRoutes);
app.use("/", userRoutes);
app.use("/", popularRoutes);
app.use("/", likeRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
