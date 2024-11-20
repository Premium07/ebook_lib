import express from "express";
import { loginUser, registerUser } from "./userController";

const userRouter = express.Router();

// routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

export default userRouter;
