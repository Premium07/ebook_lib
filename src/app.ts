import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";

const app = express();

// Routes

app.get("/", (req, res, next) => {
  res.json({ message: "Hello, this is ebook lib API" });
});

app.use("/api/users", userRouter);

// Global error handler
app.use(globalErrorHandler);

export default app;
