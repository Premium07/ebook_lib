import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModal from "./userModal";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password } = req.body;
  // validation
  if (!username || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }
  // Database call
  try {
    const user = await userModal.findOne({ email });
    if (user) {
      const error = createHttpError(400, `User already exits with this email`);
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user"));
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  let newUser: User;
  try {
    newUser = await userModal.create({
      username,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user."));
  }

  try {
    // token generation with JWT
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    // response
    res.status(201).json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Error while signing JWT token"));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createHttpError(400, "All fields are required"));
  }

  try {
    const user = await userModal.findOne({ email });

    if (!user) {
      return next(createHttpError(404, "User not found."));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return next(createHttpError(400, "Invalid credentials"));

    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });

    res.json({ accessToken: token });
  } catch (error) {
    console.log(error);
  }
};

export { registerUser, loginUser };
