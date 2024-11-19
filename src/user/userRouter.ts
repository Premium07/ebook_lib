import express from "express";
import { registerUser } from "./userController";

const userRouter = express.Router();

// routes
userRouter.post("/register", registerUser);

export default userRouter;
