import express from "express";

const app = express();

// Routes

app.get("/", (req, res, next) => {
  res.json({ message: "Hello, this is ebook lib API" });
});

export default app;
